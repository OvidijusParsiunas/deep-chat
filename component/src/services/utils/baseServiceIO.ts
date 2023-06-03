import {CompletionsHandlers, KeyVerificationHandlers, ServiceFileTypes, ServiceIO, StreamHandlers} from '../serviceIO';
import {CameraFilesServiceConfig, FilesUploader, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {GenericObject} from '../../types/object';
import {FILE_TYPES} from '../../types/fileTypes';
import {BuildFileTypes} from './buildFileTypes';
import {AiAssistant} from '../../aiAssistant';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type Config = true | (FilesUploader & ServiceCallConfig);

// used for existing services - WORK - maybe rename to ExistingServiceIO
export class BaseServideIO implements ServiceIO {
  key?: string;
  validateConfigKey = false;
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  canSendMessage: ValidateMessageBeforeSending = BaseServideIO.canSendMessage;
  requestSettings: RequestSettings = this.buildRequestSettings('');
  requestInterceptor: RequestInterceptor = (details) => details;
  responseInterceptor: ResponseInterceptor = (result) => result;
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, fileType?: FILE_TYPES, defaultFileTypes?: ServiceFileTypes) {
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    if (typeof config === 'object' && config.key) {
      this.requestSettings = this.buildRequestSettings(config.key || '', config.request);
      this.key = config.key;
    } 
    const {validateMessageBeforeSending} = aiAssistant;
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    // don't bother cleaning the config as we construct _raw_body with individual props
    if (typeof config === 'object') {
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.responseInterceptor = config.responseInterceptor;
    }
    BuildFileTypes.build(aiAssistant, this, defaultFileTypes);
    if (typeof config === 'object') this.cleanServiceConfig(config);
    if (aiAssistant.validateKeyProperty) this.validateConfigKey = aiAssistant.validateKeyProperty;
  }

  private buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers = this.buildHeadersFunc(key);
    return requestSettingsObj;
  }

  private cleanServiceConfig(config: ServiceCallConfig) {
    delete config.key;
    delete config.request;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private keyAuthenticated(onSuccess: () => void, key: string) {
    this.requestSettings = this.buildRequestSettings(key, this.requestSettings);
    this.key = key;
    onSuccess();
  }

  // prettier-ignore
  verifyKey(key: string, keyVerificationHandlers: KeyVerificationHandlers) {
    const {url, method, handleVerificationResult, createHeaders, body} = this.keyVerificationDetails;
    const headers = createHeaders?.(key) || this.buildHeadersFunc(key);
    HTTPRequest.verifyKey(key, url, headers, method,
      this.keyAuthenticated.bind(this, keyVerificationHandlers.onSuccess), keyVerificationHandlers.onFail,
      keyVerificationHandlers.onLoad, handleVerificationResult, body);
  }

  callApi(_: Messages, __: CompletionsHandlers, ___: StreamHandlers, ____?: File[]) {}
}
