import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {KeyVerificationHandlers, ServiceFileTypes} from '../serviceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BuildHeadersFunc} from '../../types/headers';
import {BaseServiceIO} from './baseServiceIO';
import {Request} from '../../types/request';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class DirectServiceIO extends BaseServiceIO {
  key?: string;
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  sessionId?: string;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, existingFileTypes);
    Object.assign(this.rawBody, deepChat.request?.additionalBodyProps);
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    if (apiKey) this.setApiKeyProperties(apiKey);
    this.requestSettings = this.buildRequestSettings(this.key || '', deepChat.request);
  }

  private setApiKeyProperties(apiKey: APIKey) {
    this.key = apiKey.key;
    if (apiKey.validateKeyProperty) this.validateConfigKey = apiKey.validateKeyProperty;
  }

  private buildRequestSettings(key: string, requestSettings?: Request) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers = this.buildHeadersFunc(key);
    return requestSettingsObj;
  }

  private keyAuthenticated(onSuccess: () => void, key: string) {
    this.requestSettings = this.buildRequestSettings(key, this.requestSettings);
    this.key = key;
    onSuccess();
  }

  // prettier-ignore
  override verifyKey(key: string, keyVerificationHandlers: KeyVerificationHandlers) {
    const {url, method, handleVerificationResult, createHeaders, body} = this.keyVerificationDetails;
    const headers = createHeaders?.(key) || this.buildHeadersFunc(key);
    HTTPRequest.verifyKey(key, url, headers, method,
      this.keyAuthenticated.bind(this, keyVerificationHandlers.onSuccess), keyVerificationHandlers.onFail,
      keyVerificationHandlers.onLoad, handleVerificationResult, body);
  }

  override isDirectConnection() {
    return true;
  }
}
