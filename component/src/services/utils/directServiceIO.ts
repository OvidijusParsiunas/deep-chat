import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {ChatFunctionHandler, FunctionsDetails} from '../../types/openAI';
import {KeyVerificationHandlers, ServiceFileTypes} from '../serviceIO';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BuildHeadersFunc} from '../../types/headers';
import {Stream} from '../../utils/HTTP/stream';
import {BaseServiceIO} from './baseServiceIO';
import {Connect} from '../../types/connect';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

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

  protected async callToolFunction(functionHandler: ChatFunctionHandler, functions: FunctionsDetails) {
    this.asyncCallInProgress = true;
    const handlerResponse = await functionHandler(functions);
    if (!Array.isArray(handlerResponse)) {
      if (handlerResponse.text) {
        const response = {text: handlerResponse.text};
        const processedResponse = (await this.deepChat.responseInterceptor?.(response)) || response;
        if (Array.isArray(processedResponse)) throw Error('Function tool response interceptor cannot return an array');
        return {processedResponse};
      }
      throw Error('Function tool response must be an array or contain a text property');
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
      return {text: ''};
    } catch (e) {
      this.asyncCallInProgress = false;
      throw e;
    }
  }
}
