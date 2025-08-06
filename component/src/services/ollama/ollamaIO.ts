import {OllamaConverseResult, OllamaStreamResult} from '../../types/ollamaResult';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {FetchFunc, RequestUtils} from '../../utils/HTTP/requestUtils';
import {DirectConnection} from '../../types/directConnection';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {DirectServiceIO} from '../utils/directServiceIO';
import {ChatFunctionHandler} from '../../types/openAI';
import {MessageFile} from '../../types/messageFile';
import {OllamaUtils} from './utils/ollamaUtils';
import {Stream} from '../../utils/HTTP/stream';
import {OllamaChat} from '../../types/ollama';
import {DeepChat} from '../../deepChat';
import {
  OllamaConverseBodyInternal,
  SystemMessageInternal,
  OllamaToolCall,
  OllamaMessage,
} from '../../types/ollamaInternal';

export class OllamaIO extends DirectServiceIO {
  override insertKeyPlaceholderText = '';
  override keyHelpUrl = '';
  override validateKeyProperty = false;
  url = 'http://localhost:11434/api/chat';
  permittedErrorPrefixes = ['Error'];
  private readonly _systemMessage?: SystemMessageInternal;
  _functionHandler?: ChatFunctionHandler;
  asyncCallInProgress = false;
  private _messages?: Messages;

  constructor(deepChat: DeepChat) {
    const directConnectionCopy = JSON.parse(JSON.stringify(deepChat.directConnection)) as DirectConnection;
    const keyVerificationDetails = OllamaUtils.buildKeyVerificationDetails();
    const buildHeadersFunc = OllamaUtils.buildHeaders;
    super(deepChat, keyVerificationDetails, buildHeadersFunc, {key: 'placeholder'});
    const config = directConnectionCopy.ollama;
    if (typeof config === 'object') {
      if (config.system) this._systemMessage = OllamaIO.generateSystemMessage(config.system);
      const function_handler = (deepChat.directConnection?.ollama as OllamaChat)?.function_handler;
      if (function_handler) this._functionHandler = function_handler;
      this.cleanConfig(config);
      Object.assign(this.rawBody, config);
    }
    this.maxMessages ??= -1;
    this.rawBody.model ??= 'llama3.2';
    this.rawBody.stream ??= false;
  }

  private static generateSystemMessage(system: string): SystemMessageInternal {
    return {role: 'system', content: system};
  }

  private cleanConfig(config: OllamaChat) {
    delete config.system;
    delete config.function_handler;
  }

  private static getImageData(files: MessageFile[]): string[] {
    return files
      .filter((file) => file.type === 'image')
      .map((file) => {
        const base64Data = file.src?.split(',')[1];
        return base64Data || '';
      })
      .filter((data) => data.length > 0);
  }

  private preprocessBody(body: OllamaConverseBodyInternal, pMessages: MessageContentI[]) {
    const bodyCopy = JSON.parse(JSON.stringify(body));
    const processedMessages = MessageLimitUtils.getCharacterLimitMessages(
      pMessages,
      this.totalMessagesMaxCharLength ? this.totalMessagesMaxCharLength - (this._systemMessage?.content.length || 0) : -1
    ).map((message) => {
      const ollamaMessage: OllamaMessage = {
        content: message.text || '',
        role: message.role === MessageUtils.USER_ROLE ? 'user' : 'assistant',
      };

      if (message.files && message.files.length > 0) {
        const images = OllamaIO.getImageData(message.files);
        if (images.length > 0) {
          ollamaMessage.images = images;
        }
      }

      return ollamaMessage;
    });

    bodyCopy.messages = [...processedMessages];
    if (this._systemMessage) bodyCopy.messages.unshift(this._systemMessage);
    return bodyCopy;
  }

  override async callServiceAPI(messages: Messages, pMessages: MessageContentI[]) {
    if (!this.connectSettings) throw new Error('Request settings have not been set up');
    this._messages ??= messages;
    const body = this.preprocessBody(this.rawBody, pMessages);
    const stream = this.stream;
    if ((stream && (typeof stream !== 'object' || !stream.simulation)) || body.stream) {
      body.stream = true;
      this.stream = {readable: true};
      Stream.request(this, body, messages);
    } else {
      HTTPRequest.request(this, body, messages);
    }
  }

  override async extractResultData(
    result: OllamaConverseResult,
    fetchFunc?: FetchFunc,
    prevBody?: OllamaChat
  ): Promise<ResponseI> {
    if (result.error) throw result.error.message;

    if (result.text) {
      const parsedStreamBody = JSON.parse(result.text) as OllamaStreamResult;
      if (parsedStreamBody.message?.tool_calls) {
        this.asyncCallInProgress = true;
        return this.handleTools({tool_calls: parsedStreamBody.message.tool_calls}, fetchFunc, prevBody);
      }
      this.asyncCallInProgress = false;
      return {text: parsedStreamBody.message?.content || ''};
    }

    if (result.message) {
      if (result.message.tool_calls) {
        return this.handleTools({tool_calls: result.message.tool_calls}, fetchFunc, prevBody);
      }
      return {text: result.message.content || ''};
    }

    return {text: ''};
  }

  private async handleTools(
    tools: {tool_calls: OllamaToolCall[]},
    fetchFunc?: FetchFunc,
    prevBody?: OllamaChat
  ): Promise<ResponseI> {
    if (!tools.tool_calls || !fetchFunc || !prevBody || !this._functionHandler) {
      throw Error(
        'Please define the `function_handler` property inside' +
          ' the [ollama](https://deepchat.dev/docs/directConnection/ollama) object.'
      );
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const handlerResponse = await this._functionHandler?.(functions);
    if (!Array.isArray(handlerResponse)) {
      if (handlerResponse.text) {
        const response = {text: handlerResponse.text};
        const processedResponse = (await this.deepChat.responseInterceptor?.(response)) || response;
        if (Array.isArray(processedResponse)) throw Error('Function tool response interceptor cannot return an array');
        return processedResponse;
      }
      throw Error('Function tool response must be an array or contain a text property');
    }
    const responses = await Promise.all(handlerResponse);
    bodyCp.messages.push({tool_calls: tools.tool_calls, role: 'assistant', content: ''});
    if (!responses.find(({response}) => typeof response !== 'string') && functions.length === responses.length) {
      responses.forEach((resp, index) => {
        const toolCall = tools.tool_calls?.[index];
        bodyCp?.messages.push({
          role: 'tool',
          tool_name: toolCall?.function.name,
          content: resp.response,
        });
      });
      try {
        if (this.stream && this._messages) {
          Stream.request(this, bodyCp, this._messages);
          return {text: ''};
        }
        let result = await fetchFunc?.(bodyCp).then((resp) => RequestUtils.processResponseByType(resp));
        result = (await this.deepChat.responseInterceptor?.(result)) || result;
        if (result.error) throw result.error.message;
        return {text: result.message?.content || ''};
      } catch (e) {
        this.asyncCallInProgress = false;
        throw e;
      }
    }
    throw Error('Function tool response must be an array or contain a text property');
  }
}
