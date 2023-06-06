import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {KeyVerificationHandlers, ServiceFileTypes} from '../serviceIO';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {BaseServiceIO} from './baseServiceIO';
import {APIKey} from '../../types/APIKey';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type Config = true | APIKey;

// using I in the front so that users don't mistake this for ExistingService
export class IExistingServiceIO extends BaseServiceIO {
  key?: string;
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, defaultFileTypes?: ServiceFileTypes) {
    super(aiAssistant, defaultFileTypes);
    Object.assign(this.rawBody, aiAssistant.request?.body);
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    const {request} = aiAssistant;
    if (typeof config === 'object') {
      this.key = config.key;
      if (config.validateKeyProperty) this.validateConfigKey = config.validateKeyProperty;
    }
    this.requestSettings = this.buildRequestSettings(this.key || '', request);
    this.cleanServiceConfig(config);
  }

  private cleanServiceConfig(config?: Config) {
    if (typeof config === 'object') {
      delete config.key;
      delete config.validateKeyProperty;
    }
  }

  private buildRequestSettings(key: string, requestSettings?: RequestSettings) {
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
}
