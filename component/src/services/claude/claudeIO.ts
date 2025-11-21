import {DEFINE_FUNCTION_HANDLER, FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR} from '../../utils/errorMessages/errorMessages';
import {AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX, OBJECT} from '../utils/serviceConstants';
import {CLAUDE_BUILD_HEADERS, CLAUDE_BUILD_KEY_VERIFICATION_DETAILS} from './utils/claudeUtils';
import {ERROR, FILE, IMAGE, SRC, TEXT, TYPE, USER} from '../../utils/consts/messageConstants';
import {ClaudeContent, ClaudeMessage, ClaudeRequestBody} from '../../types/claudeInternal';
import {ClaudeResult, ClaudeTextContent, ClaudeToolUse} from '../../types/claudeResult';
import {DirectConnection} from '../../types/directConnection';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageFile} from '../../types/messageFile';
import {Claude} from '../../types/claude';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.anthropic.com/en/api/messages
export class ClaudeIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Claude');
  override keyHelpUrl = 'https://console.anthropic.com/settings/keys';
  url = 'https://api.anthropic.com/v1/messages';
  permittedErrorPrefixes = [AUTHENTICATION_ERROR_PREFIX, INVALID_REQUEST_ERROR_PREFIX];
  private _streamToolCalls: ClaudeToolUse = {[TYPE]: 'tool_use', id: '', name: '', input: ''};

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.claude as Claude & APIKey;
    super(deepChat, CLAUDE_BUILD_KEY_VERIFICATION_DETAILS(), CLAUDE_BUILD_HEADERS, config);
    if (typeof config === OBJECT) {
      this.completeConfig(config, deepChat.directConnection?.claude?.function_handler);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'claude-sonnet-4-5-20250929';
    this.rawBody.max_tokens ??= 4096;
  }
  private static getFileContent(files: MessageFile[]): ClaudeContent[] {
    return files.map((file) => {
      if (file.type === IMAGE) {
        const base64Data = file[SRC]?.split(',')[1];
        const mediaType = file[SRC]?.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        return {[TYPE]: IMAGE, source: {[TYPE]: 'base64', media_type: mediaType, data: base64Data || ''}};
      }
      return {[TYPE]: TEXT, [TEXT]: `[Unsupported ${FILE} type: ${file.type}]`};
    });
  }

  private preprocessBody(body: ClaudeRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as ClaudeRequestBody;
    const processedMessages = this.processMessages(pMessages).map((message) => {
      return {
        content: ClaudeIO.getTextWFilesContent(message, ClaudeIO.getFileContent),
        role: DirectServiceIO.getRoleViaUser(message.role),
      } as ClaudeMessage;
    });

    bodyCopy.messages = processedMessages;
    if (this.systemMessage) {
      bodyCopy.system = this.systemMessage;
    }
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    this.messages ??= messages;
    this.callDirectServiceServiceAPI(messages, pMessages, this.preprocessBody.bind(this), {});
  }

  override async extractResultData(result: ClaudeResult, prevBody?: ClaudeRequestBody): Promise<ResponseI> {
    if (result[ERROR]) throw result[ERROR].message;

    // Handle non-streaming response (final response)
    if (result.content && result.content.length > 0) {
      // Check for tool use in the response
      const toolUseContent = result.content.find((item): item is ClaudeToolUse => item.type === 'tool_use');
      if (toolUseContent) {
        return this.handleTools([toolUseContent], prevBody);
      }

      const textContent = result.content.find((item): item is ClaudeTextContent => item.type === TEXT);
      if (textContent) {
        return {[TEXT]: textContent[TEXT]};
      }
    }

    // Handle streaming events
    if (result.type === 'content_block_delta') {
      if (result.delta && result.delta.type === 'text_delta') {
        return {[TEXT]: result.delta[TEXT] || ''};
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
    return {[TEXT]: ''};
  }

  private async handleTools(toolUseBlocks: ClaudeToolUse[], prevBody?: ClaudeRequestBody): Promise<ResponseI> {
    if (!toolUseBlocks || !prevBody || !this.functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = toolUseBlocks.map((block) => {
      return {name: block.name, arguments: JSON.stringify(block.input)};
    });
    const {responses, processedResponse} = await this.callToolFunction(this.functionHandler, functions);
    if (processedResponse) return processedResponse;

    // Add assistant message with tool use
    const assistantContent = toolUseBlocks.map((block) => ({
      [TYPE]: 'tool_use',
      id: block.id,
      name: block.name,
      input: block.input,
    }));
    bodyCp.messages.push({
      role: 'assistant',
      content: assistantContent,
    });

    // Add tool results
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      const toolResultContent = responses.map((resp, index) => ({
        [TYPE]: 'tool_result' as const,
        tool_use_id: toolUseBlocks[index].id,
        content: resp.response,
      }));

      bodyCp.messages.push({role: USER, content: toolResultContent});

      return this.makeAnotherRequest(bodyCp, this.messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
