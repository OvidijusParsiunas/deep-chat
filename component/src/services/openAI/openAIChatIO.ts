import {FunctionHandler, OpenAIChat, OpenAIConverse, OpenAIMessage, OpenAIToolsAPI} from '../../types/openAI';
import {OpenAIConverseBodyInternal, SystemMessageInternal} from '../../types/openAIInternal';
import {OpenAIConverseBaseBody} from './utils/openAIConverseBaseBody';
import {FetchFunc, RequestUtils} from '../../utils/HTTP/requestUtils';
import {DirectConnection} from '../../types/directConnection';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseT} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {MessageContent} from '../../types/messages';
import {OpenAIUtils} from './utils/openAIUtils';
import {Stream} from '../../utils/HTTP/stream';
import {DeepChat} from '../../deepChat';

// chat is a form of completions
export class OpenAIChatIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'OpenAI API Key';
  override getKeyLink = 'https://platform.openai.com/account/api-keys';
  url = 'https://api.openai.com/v1/chat/completions';
  permittedErrorPrefixes = ['Incorrect'];
  private _latestBodyCp?: Required<OpenAIConverseBodyInternal> & OpenAIToolsAPI;
  private readonly _functionHandler?: FunctionHandler;
  private readonly _systemMessage: SystemMessageInternal =
    OpenAIChatIO.generateSystemMessage('You are a helpful assistant.');

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const apiKey = directConnectionCopy.openAI;
    super(deepChat, OpenAIUtils.buildKeyVerificationDetails(), OpenAIUtils.buildHeaders, apiKey);
    const config = directConnectionCopy.openAI?.chat; // can be undefined as this is the default service
    if (typeof config === 'object') {
      if (config.system_prompt) this._systemMessage = OpenAIChatIO.generateSystemMessage(config.system_prompt);
      const {function_handler} = deepChat.directConnection?.openAI?.chat as OpenAIChat;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= OpenAIConverseBaseBody.GPT_CHAT_TURBO_MODEL;
  }

  private static generateSystemMessage(system_prompt: string): SystemMessageInternal {
    return {role: 'system', content: system_prompt};
  }

  private cleanConfig(config: OpenAIConverse & OpenAIChat) {
    delete config.system_prompt;
    delete config.function_handler;
  }

  // prettier-ignore
  private preprocessBody(body: OpenAIConverseBodyInternal, pMessages: MessageContent[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const totalMessagesMaxCharLength = this.totalMessagesMaxCharLength || OpenAIUtils.CONVERSE_MAX_CHAR_LENGTH;
    const textMessages = pMessages.filter((message) => message.text);
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(textMessages,
        totalMessagesMaxCharLength - this._systemMessage.content.length)
      .map((message) => ({content: message.text, role: message.role === 'ai' ? 'assistant' : 'user'}));
    bodyCopy.messages = [this._systemMessage, ...processedMessages];
    this._latestBodyCp = bodyCopy;
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContent[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const body = this.preprocessBody(this.rawBody, pMessages);
    if (this.deepChat.stream || body.stream) {
      body.stream = true;
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(result: OpenAIConverseResult, fetchFunc?: FetchFunc): Promise<ResponseT> {
    if (result.error) throw result.error.message;
    if (result.choices[0].delta) {
      return {text: result.choices[0].delta.content || ''};
    }
    if (result.choices[0].message) {
      if (result.choices[0].message.tool_calls) {
        return this.handleTools(result.choices[0].message, fetchFunc);
      }
      return {text: result.choices[0].message.content};
    }
    return {text: ''};
  }

  private async handleTools(message: OpenAIMessage, fetchFunc?: FetchFunc): Promise<ResponseT> {
    // tool_calls, requestFunc and _latestBody should theoretically already be defined
    if (!message.tool_calls || !fetchFunc || !this._latestBodyCp || !this._functionHandler) {
      throw Error(
        'Please define the `function_handler` property inside' +
          ' the [openAI](https://deepchat.dev/docs/directConnection/openAI#Chat) object.'
      );
    }
    const handlerResponse = await this._functionHandler?.(message.tool_calls);
    if (handlerResponse.text) return {text: handlerResponse.text};
    this._latestBodyCp.messages.push(message);
    if (Array.isArray(handlerResponse)) {
      handlerResponse.forEach((resp) => {
        this._latestBodyCp?.messages.push({role: 'tool', ...resp});
      });
      delete this._latestBodyCp.tools;
      delete this._latestBodyCp.tool_choice;
      const result = await fetchFunc?.(this._latestBodyCp).then((resp) => RequestUtils.processResponseByType(resp));
      if (result.error) throw result.error.message;
      return {text: result.choices[0].message.content || ''};
    }
    throw Error('Response object must contain a FunctionHandlerResponse object');
  }
}
