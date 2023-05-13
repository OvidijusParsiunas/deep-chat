import {CameraFilesServiceConfig, FilesServiceConfig, RecordAudioFilesServiceConfig} from '../../types/fileServiceConfigs';
import {CompletionsHandlers, KeyVerificationHandlers, ServiceFileTypes, ServiceIO, StreamHandlers} from '../serviceIO';
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
import {GenericButton} from '../../types/button';
import {CustomStyle} from '../../types/styles';
import {AiAssistant} from '../../aiAssistant';
import {Remarkable} from 'remarkable';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type Camera = {camera?: true | {button?: GenericButton; modalContainerStyle?: CustomStyle}};

type Microphone = {microphone?: true | {styles?: MicrophoneStyles; maxDurationSeconds?: number; format?: AudioFormat}};

type Config = true | (FilesServiceConfig & Camera & Microphone);

export class BaseServideIO implements ServiceIO {
  insertKeyPlaceholderText = 'API Key';
  getKeyLink = '';
  canSendMessage: ValidateMessageBeforeSending = BaseServideIO.canSendMessage;
  requestSettings?: RequestSettings;
  requestInterceptor: RequestInterceptor = (details) => details;
  resposeInterceptor: ResponseInterceptor = (result) => result;
  fileTypes?: ServiceFileTypes;
  camera?: CameraFilesServiceConfig;
  recordAudio?: RecordAudioFilesServiceConfig;
  private readonly keyVerificationDetails: KeyVerificationDetails;
  private readonly buildHeadersFunc: BuildHeadersFunc;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, key?: string, fileType?: FILE_TYPES) {
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    const {validateMessageBeforeSending} = aiAssistant;
    // don't bother cleaning the config as we construct _raw_body with individual props
    if (typeof config === 'object') {
      if (config.requestInterceptor) this.requestInterceptor = config.requestInterceptor;
      if (config.responseInterceptor) this.resposeInterceptor = config.responseInterceptor;
    }
    if (fileType) {
      this.fileTypes = {};
      const remarkable = RemarkableConfig.createNew();
      if (fileType === 'audio') this.processAudioConfig(remarkable, config);
      if (fileType === 'images') this.processImagesConfig(remarkable, config);
    }
    const requestSettings = typeof config === 'object' ? config.request : undefined;
    if (key) this.requestSettings = key ? this.buildRequestSettings(key, requestSettings) : requestSettings;
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    if (typeof config === 'object') this.cleanServiceConfig(config);
  }

  private processAudioConfig(remarkable: Remarkable, config?: Config) {
    if (!this.fileTypes) return;
    this.fileTypes.audio = {files: {acceptedFormats: '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a', maxNumberOfFiles: 1}};
    if (config && typeof config !== 'boolean') {
      ConfigProcessingUtils.processAudioConfig(this.fileTypes.audio, remarkable, config.files, config.button);
      if (config?.microphone) this.recordAudio = ConfigProcessingUtils.processRecordAudioConfig(config?.microphone);
    }
  }

  private processImagesConfig(remarkable: Remarkable, config?: Config) {
    if (!this.fileTypes) return;
    this.fileTypes.images = {files: {acceptedFormats: '.png,.jpg', maxNumberOfFiles: 1}};
    if (config && typeof config !== 'boolean') {
      ConfigProcessingUtils.processImagesConfig(this.fileTypes.images, remarkable, config.files, config.button);
      if (config.camera) this.camera = ConfigProcessingUtils.processCameraConfig(config.camera);
    }
  }

  private buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers ??= this.buildHeadersFunc(key);
    return requestSettingsObj;
  }

  private cleanServiceConfig(config: ServiceCallConfig) {
    delete config.request;
    delete config.requestInterceptor;
    delete config.responseInterceptor;
  }

  private static canSendMessage(text: string) {
    return text.trim() !== '';
  }

  private addKey(onSuccess: (key: string) => void, key: string) {
    this.requestSettings = this.buildRequestSettings(key, this.requestSettings);
    onSuccess(key);
  }

  // prettier-ignore
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {
    const {url, method, handleVerificationResult, createHeaders, body} = this.keyVerificationDetails;
    const key = inputElement.value.trim();
    const headers = createHeaders?.(key) || this.buildHeadersFunc(key);
    HTTPRequest.verifyKey(key, url, headers, method,
      this.addKey.bind(this, keyVerificationHandlers.onSuccess), keyVerificationHandlers.onFail,
      keyVerificationHandlers.onLoad, handleVerificationResult, body);
  }

  callApi(_: Messages, __: CompletionsHandlers, ___: StreamHandlers, ____?: File[]) {}
}
