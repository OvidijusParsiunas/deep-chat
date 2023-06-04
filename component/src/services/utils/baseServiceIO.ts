import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {RequestSettings} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {GenericObject} from '../../types/object';
import {AiAssistant} from '../../aiAssistant';
import {SetFileTypes} from './setFileTypes';
import {APIKey} from '../../types/APIKey';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  StreamHandlers,
  FileServiceIO,
  ServiceIO,
} from '../serviceIO';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type Config = true | APIKey;

// used for existing services - WORK - maybe rename to ExistingServiceIO
export class BaseServideIO implements ServiceIO {
  key?: string;
  validateConfigKey = false;
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  canSendMessage: ValidateMessageBeforeSending = BaseServideIO.canSendMessage;
  requestSettings: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  responseInterceptor: ResponseInterceptor = (result) => result;
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, defaultFileTypes?: ServiceFileTypes) {
    // WORK - this needs to accept files if original IO does not
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    const {request,
      validateMessageBeforeSending, requestInterceptor, responseInterceptor} = aiAssistant;
    if (typeof config === 'object') {
      this.key = config.key;
      if (config.validateKeyProperty) this.validateConfigKey = config.validateKeyProperty;
    }
    this.requestSettings = this.buildRequestSettings(this.key || '', request);
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    BaseServideIO.populateDefaultFileIO(defaultFileTypes?.audio, '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a');
    BaseServideIO.populateDefaultFileIO(defaultFileTypes?.images, '.png,.jpg');
    SetFileTypes.set(aiAssistant, this, defaultFileTypes);
    if (requestInterceptor) this.requestInterceptor = requestInterceptor;
    if (responseInterceptor) this.responseInterceptor = responseInterceptor;
  }

  private buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers = this.buildHeadersFunc(key);
    return requestSettingsObj;
  }

  private static populateDefaultFileIO(fileIO: FileServiceIO | undefined, acceptedFormats: string) {
    if (fileIO) {
      fileIO.files ??= {};
      fileIO.files.acceptedFormats ??= acceptedFormats;
      fileIO.files.maxNumberOfFiles ??= 1;
    }
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
