import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
import {ChatFunctionHandler, FunctionsDetails} from '../../types/openAI';
import {KeyVerificationHandlers, ServiceFileTypes} from '../serviceIO';
import {TEXT_KEY} from '../../utils/consts/messageConstants';
import {MessageContentI} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BuildHeadersFunc} from '../../types/headers';
import {MessageFile} from '../../types/messageFile';
import {StreamConfig} from '../../types/stream';
import {Stream} from '../../utils/HTTP/stream';
import {BaseServiceIO} from './baseServiceIO';
import {Connect} from '../../types/connect';
import {APIKey} from '../../types/APIKey';
import {OBJECT} from './serviceConstants';
import {DeepChat} from '../../deepChat';
import {
  FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR,
  DEFINE_FUNCTION_HANDLER,
  REQUEST_SETTINGS_ERROR,
} from '../../utils/errorMessages/errorMessages';

export class DirectServiceIO extends BaseServiceIO {
  key?: string;
  insertKeyPlaceholderText = 'API Key';
  keyHelpUrl = '';
  sessionId?: string;
  asyncCallInProgress = false;
  private readonly _keyVerificationDetails: KeyVerificationDetails;
  private readonly _buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, existingFileTypes);
    Object.assign(this.rawBody, deepChat.connect?.additionalBodyProps);
    this._keyVerificationDetails = keyVerificationDetails;
    this._buildHeadersFunc = buildHeadersFunc;
    if (apiKey) this.setApiKeyProperties(apiKey);
    this.connectSettings = this.buildConnectSettings(this.key || '', deepChat.connect);
  }

  private setApiKeyProperties(apiKey: APIKey) {
    this.key = apiKey.key;
    if (apiKey.validateKeyProperty) this.validateKeyProperty = apiKey.validateKeyProperty;
  }

  private buildConnectSettings(key: string, connectSettings?: Connect) {
    const connectSettingsObj = connectSettings ?? {};
    connectSettingsObj.headers ??= {};
    Object.assign(connectSettingsObj.headers, this._buildHeadersFunc(key));
    return connectSettingsObj;
  }

  private keyAuthenticated(onSuccess: () => void, key: string) {
    this.connectSettings = this.buildConnectSettings(key, this.connectSettings);
    this.key = key;
    onSuccess();
  }

  // prettier-ignore
  override verifyKey(key: string, keyVerificationHandlers: KeyVerificationHandlers) {
    const {url, method, handleVerificationResult, createHeaders, body, augmentUrl} = this._keyVerificationDetails;
    const headers = createHeaders?.(key) || this._buildHeadersFunc(key);
    const processedUrl = augmentUrl?.(key) || url;
    HTTPRequest.verifyKey(key, processedUrl, headers, method,
      this.keyAuthenticated.bind(this, keyVerificationHandlers.onSuccess), keyVerificationHandlers.onFail,
      keyVerificationHandlers.onLoad, handleVerificationResult, body);
  }

  override isDirectConnection() {
    return true;
  }

  protected static getRoleViaUser(role: string) {
    return role === MessageUtils.USER_ROLE ? MessageUtils.USER_ROLE : MessageUtils.ASSISTANT_ROLE;
  }

  protected static getRoleViaAI(role: string) {
    return role === MessageUtils.AI_ROLE ? MessageUtils.ASSISTANT_ROLE : MessageUtils.USER_ROLE;
  }

  async callDirectServiceServiceAPI(
    messages: Messages,
    pMessages: MessageContentI[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    preprocessBody: (body: any, messages: MessageContentI[]) => any,
    streamConfig?: StreamConfig,
    stringifyBody?: boolean
  ) {
    if (!this.connectSettings) throw new Error(REQUEST_SETTINGS_ERROR);
    const body = preprocessBody(this.rawBody, pMessages);
    const stream = streamConfig ? this.stream : false;
    if ((stream && (typeof stream !== OBJECT || !(stream as StreamConfig).simulation)) || body.stream) {
      body.stream = true;
      if (streamConfig?.readable) this.stream = {readable: true};
      Stream.request(this, body, messages);
    } else {
      return await HTTPRequest.request(this, body, messages, stringifyBody);
    }
  }

  protected async callToolFunction(functionHandler: ChatFunctionHandler, functions: FunctionsDetails) {
    this.asyncCallInProgress = true;
    const handlerResponse = await functionHandler(functions);
    if (!Array.isArray(handlerResponse)) {
      if (handlerResponse.text) {
        const response = {[TEXT_KEY]: handlerResponse.text};
        const processedResponse = (await this.deepChat.responseInterceptor?.(response)) || response;
        if (Array.isArray(processedResponse)) throw Error('Function tool response interceptor cannot return an array');
        return {processedResponse};
      }
      throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
    }
    const responses = await Promise.all(handlerResponse);
    return {responses};
  }

  protected makeAnotherRequest(body: object, messages?: Messages) {
    try {
      if (messages) {
        if (this.stream) {
          Stream.request(this, body, messages);
        } else {
          HTTPRequest.request(this, body, messages);
        }
      }
      return {[TEXT_KEY]: ''};
    } catch (e) {
      this.asyncCallInProgress = false;
      throw e;
    }
  }

  protected genereteAPIKeyName(serviceName: string) {
    return `${serviceName} API Key`;
  }

  protected static getImageContent(files: MessageFile[]): {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }[] {
    return files
      .filter((file) => file.type === 'image')
      .map((file) => ({
        type: 'image_url' as const,
        image_url: {
          url: file.src || '',
        },
      }))
      .filter((content) => content.image_url.url.length > 0);
  }

  protected static getTextWImagesContent(message: MessageContentI) {
    if (message.files && message.files.length > 0) {
      const content = this.getImageContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', [TEXT_KEY]: message.text});
      }
      return content.length > 0 ? content : message.text || '';
    }
    return message.text || '';
  }

  protected static getTextWFilesContent<T>(message: MessageContentI, getFileContent: (files: MessageFile[]) => T[]) {
    if (message.files && message.files.length > 0) {
      const content = getFileContent(message.files);
      if (message.text && message.text.trim().length > 0) {
        content.unshift({type: 'text', [TEXT_KEY]: message.text} as T);
      }
      return content;
    }
    return message.text || '';
  }

  protected async extractStreamResultWToolsGeneric(
    service: {
      _streamToolCalls?: {
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }[];
    },
    choice: {
      delta?: {
        content?: string | null;
        tool_calls?: {
          id: string;
          function: {
            name: string;
            arguments: string;
          };
        }[];
      };
      finish_reason?: 'stop' | 'length' | 'tool_calls' | string | null;
    },
    functionHandler?: ChatFunctionHandler,
    messages?: Messages,
    prevBody?: unknown,
    system?: {message?: string}
  ) {
    const {delta, finish_reason} = choice;
    if (finish_reason === 'tool_calls') {
      const tools = {tool_calls: service._streamToolCalls};
      service._streamToolCalls = undefined;
      return this.handleToolsGeneric(tools, functionHandler, messages, prevBody, system);
    } else if (delta?.tool_calls) {
      if (!service._streamToolCalls) {
        service._streamToolCalls = delta.tool_calls;
      } else {
        delta.tool_calls.forEach((tool, index) => {
          if (service._streamToolCalls) service._streamToolCalls[index].function.arguments += tool.function.arguments;
        });
      }
    }
    return {[TEXT_KEY]: delta?.content || ''};
  }

  protected async handleToolsGeneric(
    tools: {
      tool_calls?: {
        id: string;
        function: {
          name: string;
          arguments: string;
        };
      }[];
    },
    functionHandler?: ChatFunctionHandler,
    messages?: Messages,
    prevBody?: unknown,
    system?: {message?: string}
  ): Promise<ResponseI> {
    if (!tools.tool_calls || !prevBody || !functionHandler) {
      throw Error(DEFINE_FUNCTION_HANDLER);
    }
    const bodyCp = JSON.parse(JSON.stringify(prevBody));
    const functions = tools.tool_calls.map((call) => {
      return {name: call.function.name, arguments: call.function.arguments};
    });
    const {responses, processedResponse} = await this.callToolFunction(functionHandler, functions);
    if (processedResponse) return processedResponse;

    if (system) {
      bodyCp.messages = bodyCp.messages.slice(bodyCp.messages.length - 1);
      if (system.message) bodyCp.messages.unshift({role: 'system', content: system.message});
    }
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

      return this.makeAnotherRequest(bodyCp, messages);
    }
    throw Error(FUNCTION_TOOL_RESPONSE_STRUCTURE_ERROR);
  }
}
