import {MistralMessage, MistralRequestBody, MistralToolCall, MistralContentItem} from '../../types/mistralInternal';
import {ErrorMessages} from '../../utils/errorMessages/errorMessages';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MistralResult} from '../../types/mistralRsult';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {MistralUtils} from './utils/mistralUtils';
import {Stream} from '../../utils/HTTP/stream';
import {Response} from '../../types/response';
import {Mistral} from '../../types/mistral';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

// https://docs.mistral.ai/api/
export class MistralIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Mistral API Key';
  override keyHelpUrl = 'https://console.mistral.ai/api-keys/';
  url = 'https://api.mistral.ai/v1/chat/completions';
  permittedErrorPrefixes = ['Invalid'];
  _functionHandler?: ChatFunctionHandler;
  private readonly _systemMessage: string = 'You are a helpful assistant.';
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const config = directConnectionCopy.mistral;
    super(deepChat, MistralUtils.buildKeyVerificationDetails(), MistralUtils.buildHeaders, config);
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = config.system_prompt;
      const function_handler = deepChat.directConnection?.mistral?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'mistral-small-latest';
  }

  private cleanConfig(config: Mistral & APIKey) {
    delete config.system_prompt;
    delete config.function_handler;
    delete config.key;
  }

  private static getFileContent(files: MessageFile[]): MistralContentItem[] {
    return files.map((file) => {
      if (file.type === 'image') {
        return {type: 'image_url', image_url: file.src || ''};
      }
      return {type: 'text', text: `[Unsupported file type: ${file.type}]`};
    });
  }

  private static getContent(message: MessageContentI): string | MistralContentItem[] {
    if (message.files && message.files.length > 0) {
      const content: MistralContentItem[] = MistralIO.getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', text: message.text});
      }
      return content;
    }
    return message.text || '';
  }

  private preprocessBody(body: MistralRequestBody, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body)) as MistralRequestBody;
    const processedMessages: MistralMessage[] = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - this._systemMessage.length : -1
    ).map((message) => ({
      role: message.role === 'ai' ? 'assistant' : 'user',
      content: MistralIO.getContent(message),
    }));
    if (this._systemMessage) {
      processedMessages.unshift({role: 'system', content: this._systemMessage});
    }
    bodyCopy.messages = processedMessages;
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

  override async extractResultData(result: MistralResult, prevBody?: Mistral): Promise<Response> {
    if (result.message) throw result.message;
    if (result.error) throw result.error.message;

    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];

      // Handle streaming response
      if (choice.delta) {
        return this.extractStreamResult(choice, prevBody);
      }

      // Handle non-streaming response
      if (choice.message) {
        if (choice.message.tool_calls) {
          return this.handleTools({tool_calls: choice.message.tool_calls}, prevBody);
        }
        return {text: choice.message.content || ''};
      }
    }

    return {text: ''};
  }

  private async extractStreamResult(choice: MistralResult['choices'][0], prevBody?: Mistral) {
    const {delta, finish_reason} = choice;
    if (finish_reason === 'tool_calls' && delta?.tool_calls) {
      const tools = {tool_calls: delta.tool_calls};
      return this.handleTools(tools, prevBody);
    }
    return {text: delta?.content || ''};
  }

  // https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post
  private async handleTools(tools: {tool_calls?: MistralToolCall[]}, prevBody?: Mistral): Promise<Response> {
    if (!tools.tool_calls || !prevBody || !this._functionHandler) {
      throw Error(ErrorMessages.DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const {responses, processedResponse} = await this.callToolFunction(this._functionHandler, functions);
    if (processedResponse) return processedResponse;

    bodyCp.messages.push({tool_calls: tools.tool_calls, role: 'assistant', content: null});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          role: 'tool',
          tool_call_id: toolCall?.id,
          name: toolCall?.function.name,
          content: resp.response,
        });
      });

      return this.makeAnotherRequest(bodyCp, this._messages);
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
