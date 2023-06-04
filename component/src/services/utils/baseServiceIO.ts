import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {RequestSettings} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageLimitUtils} from './messageLimitUtils';
import {MessageContent} from '../../types/messages';
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
/* eslint-disable @typescript-eslint/no-explicit-any */
export class BaseServideIO implements ServiceIO {
  readonly raw_body: any; // WORK - allow the user to add their own custom properties
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
  private readonly _isStream: boolean = false;
  totalMessagesMaxCharLength?: number;
  maxMessages?: number;
  readonly _isTextOnly?: boolean;
  private readonly _serviceRequireFiles: boolean;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, config?: Config, defaultFileTypes?: ServiceFileTypes) {
    this.keyVerificationDetails = keyVerificationDetails;
    this.buildHeadersFunc = buildHeadersFunc;
    const {request,
      validateMessageBeforeSending, requestInterceptor, responseInterceptor} = aiAssistant;
    if (typeof config === 'object') {
      this.key = config.key;
      if (config.validateKeyProperty) this.validateConfigKey = config.validateKeyProperty;
    }
    this.requestSettings = this.buildRequestSettings(this.key || '', request);
    this.totalMessagesMaxCharLength = aiAssistant?.requestBodyMessageLimits?.totalMessagesMaxCharLength;
    this.maxMessages = aiAssistant?.requestBodyMessageLimits?.maxMessages;
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    BaseServideIO.populateDefaultFileIO(defaultFileTypes?.audio, '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a');
    BaseServideIO.populateDefaultFileIO(defaultFileTypes?.images, '.png,.jpg');
    SetFileTypes.set(aiAssistant, this, defaultFileTypes);
    if (requestInterceptor) this.requestInterceptor = requestInterceptor;
    if (responseInterceptor) this.responseInterceptor = responseInterceptor;
    this._serviceRequireFiles = !!defaultFileTypes && Object.keys(defaultFileTypes).length > 0;
    // WORK - this will not be required
    this._isTextOnly = !this.camera && !this.recordAudio && Object.keys(this.fileTypes).length === 0;
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

  private static createCustomFormDataBody(body: any, messages: MessageContent[], files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`file${index + 1}`, file));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    let textMessageIndex = 0;
    messages.forEach((message) => {
      if (message.text) formData.append(`message${(textMessageIndex += 1)}`, JSON.stringify(message));
    });
    return formData;
  }

  private getServiceIOByType(file: File) {
    if (file.type.startsWith('audio') && this.fileTypes.audio) {
      return this.fileTypes.audio;
    }
    if (file.type.startsWith('image')) {
      if (this.fileTypes.images) {
        return this.fileTypes.images;
      } else if (this.camera) {
        return this.camera;
      }
    }
    return this.fileTypes.mixedFiles;
  }

  // prettier-ignore
  callServiceAPI(messages: Messages, pMessages: MessageContent[], completionsHandlers: CompletionsHandlers,
      streamHandlers: StreamHandlers, _?: File[]) {
    const body = {messages: pMessages, ...this.raw_body};
    if (this._isStream) {
      HTTPRequest.requestStream(this, body, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
    }
  }

  // prettier-ignore
  callApiWithFiles(body: any, messages: Messages, completionsHandlers: CompletionsHandlers,
      pMessages: MessageContent[], files: File[]) {
    const formData = BaseServideIO.createCustomFormDataBody(body, pMessages, files);
    const previousRequestSettings = this.requestSettings;
    const fileIO = this.getServiceIOByType(files[0]);
    this.requestSettings = fileIO?.request || this.requestSettings;
    HTTPRequest.request(this, formData, messages, completionsHandlers.onFinish, false);
    this.requestSettings = previousRequestSettings;
  }

  // prettier-ignore
  callAPI(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
      files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const processedMessages = MessageLimitUtils.processMessages(
      messages.messages, 0, this.maxMessages, this._isTextOnly ? this.totalMessagesMaxCharLength : undefined);
    if (files && !this._serviceRequireFiles) {
      this.callApiWithFiles(this.raw_body, messages, completionsHandlers, processedMessages, files);
    } else {
      this.callServiceAPI(messages, processedMessages, completionsHandlers, streamHandlers, files);      
    }
  }
}
