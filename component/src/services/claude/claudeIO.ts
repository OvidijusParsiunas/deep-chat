import {ClaudeContent, ClaudeMessage, ClaudeRequestBody} from '../../types/claudeInternal';
import {ClaudeResult, ClaudeTextContent, ClaudeToolUse} from '../../types/claudeResult';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {ClaudeUtils} from './utils/claudeUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Claude} from '../../types/claude';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.anthropic.com/en/api/messages
export class ClaudeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Claude API Key';
  override keyHelpUrl = 'https://console.anthropic.com/settings/keys';
  url = 'https://api.anthropic.com/v1/messages';
  permittedErrorPrefixes = ['authentication_error', 'invalid_request_error'];
  _functionHandler?: ChatFunctionHandler;
  private _messages?: Messages;
  private _streamToolCalls: ClaudeToolUse = {type: 'tool_use', id: '', name: '', input: ''};
  private readonly _systemMessage: string = 'You are a helpful assistant.';

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.claude;
    super(deepChat, ClaudeUtils.buildKeyVerificationDetails(), ClaudeUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = deepChat.directConnection?.claude?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    // WORK - add a warning when using images to also use maxMessages: 1 to reduce cost
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'claude-3-5-sonnet-20241022';
    this.rawBody.max_tokens ??= 4096;
  }

  private cleanConfig(config: Claude & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private static getFileContent(files: MessageFile[]): ClaudeContent[] {
    return files.map((file) => {
      if (file.type === 'image') {
        const base64Data = file.src?.split(',')[1];
        const mediaType = file.src?.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        return {type: 'image', source: {type: 'base64', media_type: mediaType, data: base64Data || ''}};
      }
      return {type: 'text', text: `[Unsupported file type: ${file.type}]`};
    });
  }

  private static getContent(message: MessageContentI): string | ClaudeContent[] {
    if (message.files && message.files.length > 0) {
      const content: ClaudeContent[] = ClaudeIO.getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', text: message.text});
      }
      return content;
    }
    return message.text || '';
  }

  private preprocessBody(body: ClaudeRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as ClaudeRequestBody;
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => {
      return {
        content: ClaudeIO.getContent(message),
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      } as ClaudeMessage;
    });

    bodyCopy.messages = processedMessages;
    if (this._systemMessage) {
      bodyCopy.system = this._systemMessage;
    }
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this._messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: ClaudeResult, prevBody?: ClaudeRequestBody): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    // Handle non-streaming response (final response)
    if (result.content && result.content.length > 0) {
      // Check for tool use in the response
      const toolUseContent = result.content.find((item): item is ClaudeToolUse => item.type === 'tool_use');
      if (toolUseContent) {
        return this.handleTools([toolUseContent], prevBody);
      }

      const textContent = result.content.find((item): item is ClaudeTextContent => item.type === 'text');
      if (textContent) {
        return {text: textContent.text};
      }
    }

    // Handle streaming events
    if (result.type === 'content_block_delta') {
      if (result.delta && result.delta.type === 'text_delta') {
        return {text: result.delta.text || ''};
      }
    }

    // Handle streaming response
    if (result.type === 'content_block_start' && result.content_block?.type === 'tool_use') {
      this._streamToolCalls = result.content_block;
      this._streamToolCalls.input = '';
    } else if (result.type === 'content_block_delta' && result.delta?.type === 'input_json_delta') {
      this._streamToolCalls.input += result.delta.partial_json || '';
    } else if (result.type === 'message_delta' && result.delta?.stop_reason === 'tool_use') {
      this._streamToolCalls.input = JSON.parse(this._streamToolCalls.input);
      return this.handleTools([this._streamToolCalls], prevBody);
    }

    // Return empty for other event types (message_start, content_block_start, etc.)
    return {text: ''};
  }

  private async handleTools(toolUseBlocks: ClaudeToolUse[], prevBody?: ClaudeRequestBody): Promise<ResponseI> {
    if (!toolUseBlocks || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = toolUseBlocks.map((block) => {
      return {name: block.name, arguments: JSON.stringify(block.input)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

    // Add assistant message with tool use
    const assistantContent = toolUseBlocks.map((block) => ({
      type: 'tool_use' as const,
      id: block.id,
      name: block.name,
      input: block.input,
    }));
    bodyCp.messages.push({
      role: 'assistant' as const,
      content: assistantContent,
    });

    // Add tool results
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      const toolResultContent = responses.map((resp, index) => ({
        type: 'tool_result' as const,
        tool_use_id: toolUseBlocks[index].id,
        content: resp.response,
      }));

      bodyCp.messages.push({role: 'user' as const, content: toolResultContent});

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
