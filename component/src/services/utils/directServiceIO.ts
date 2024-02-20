import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {KeyVerificationHandlers, ServiceFileTypes} from '../serviceIO';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {BuildHeadersFunc} from '../../types/headers';
import {BaseServiceIO} from './baseServiceIO';
import {Connect} from '../../types/connect';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class DirectServiceIO extends BaseServiceIO {
  key?: string;
  insertKeyPlaceholderText = 'API Key';
  keyHelpUrl = '';
  sessionId?: string;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, existingFileTypes);
    Object.assign(this.rawBody, deepChat.connect?.additionalBodyProps);
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
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
    Object.assign(connectSettingsObj.headers, this.buildHeadersFunc(key));
    return connectSettingsObj;
  }

  private keyAuthenticated(onSuccess: () => void, key: string) {
    this.connectSettings = this.buildConnectSettings(key, this.connectSettings);
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
