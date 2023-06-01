import {CompletionsHandlers, KeyVerificationHandlers, ServiceFileTypes, ServiceIO, StreamHandlers} from '../serviceIO';
import {CameraFilesServiceConfig, FilesConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {RequestSettings, ServiceCallConfig} from '../../types/requestSettings';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {AudioFormat, MicrophoneStyles} from '../../types/microphone';
import {ConfigProcessingUtils} from './configProcessingUtils';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {GenericObject} from '../../types/object';
import {FILE_TYPES} from '../../types/fileTypes';
import {CustomStyle} from '../../types/styles';
import {AiAssistant} from '../../aiAssistant';
import {Button} from '../../types/button';
import {Remarkable} from 'remarkable';
import {Key} from '../../types/key';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type Camera = {camera?: true | {button?: Button; modalContainerStyle?: CustomStyle}};

type Microphone = {microphone?: true | {styles?: MicrophoneStyles; maxDurationSeconds?: number; format?: AudioFormat}};

type Config = true | (Key & FilesConfig & ServiceCallConfig & Camera & Microphone);

export class BaseServideIO implements ServiceIO {
  key?: string;
  validateConfigKey = false;
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  canSendMessage: ValidateMessageBeforeSending = BaseServideIO.canSendMessage;
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  responseInterceptor: ResponseInterceptor = (result) => result;
  fileTypes?: ServiceFileTypes;
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, fileType?: FILE_TYPES) {
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    const {validateMessageBeforeSending} = aiAssistant;
    // don't bother cleaning the config as we construct _raw_body with individual props
    if (typeof config === 'object') {
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.responseInterceptor = config.responseInterceptor;
    }
    if (fileType) {
      this.fileTypes = {};
      const remarkable = RemarkableConfig.createNew();
      if (fileType === 'audio') this.processAudioConfig(remarkable, config);
      if (fileType === 'images') this.processImagesConfig(remarkable, config);
    }
    if (typeof config === 'object' && config.key) {
      this.requestSettings = this.buildRequestSettings(config.key, config.request);
      this.key = config.key;
    }
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    if (typeof config === 'object') this.cleanServiceConfig(config);
    if (aiAssistant.validateKeyProperty) this.validateConfigKey = aiAssistant.validateKeyProperty;
  }

  private processAudioConfig(remarkable: Remarkable, config?: Config) {
    if (!this.fileTypes) return;
    this.fileTypes.audio = {files: {acceptedFormats: '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a', maxNumberOfFiles: 1}};
    if (typeof config === 'object') {
      ConfigProcessingUtils.processAudioConfig(this.fileTypes.audio, remarkable, config.files, config.button);
      if (config?.microphone) this.recordAudio = ConfigProcessingUtils.processRecordAudioConfig(config?.microphone);
    }
  }

  private processImagesConfig(remarkable: Remarkable, config?: Config) {
    if (!this.fileTypes) return;
    this.fileTypes.images = {files: {acceptedFormats: '.png,.jpg', maxNumberOfFiles: 1}};
    if (typeof config === 'object') {
      ConfigProcessingUtils.processImagesConfig(this.fileTypes.images, remarkable, config.files, config.button);
      if (config.camera) this.camera = ConfigProcessingUtils.processCameraConfig(config.camera);
    }
  }

  private buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers ??= this.buildHeadersFunc(key);
    return requestSettingsObj;
  }

  private cleanServiceConfig(config: Key & ServiceCallConfig) {
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
