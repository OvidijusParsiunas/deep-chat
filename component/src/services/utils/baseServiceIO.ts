import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {CustomServiceResponse} from '../../types/customService';
import {RequestSettings} from '../../types/requestSettings';
import {Messages} from '../../views/chat/messages/messages';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageLimitUtils} from './messageLimitUtils';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';
import {SetFileTypes} from './setFileTypes';
import {Result} from '../../types/result';
import {Demo} from '../../types/demo';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  StreamHandlers,
  FileServiceIO,
  ServiceIO,
} from '../serviceIO';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class BaseServiceIO implements ServiceIO {
  readonly rawBody: any = {};
  validateConfigKey = false;
  canSendMessage: ValidateMessageBeforeSending = BaseServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  requestInterceptor: RequestInterceptor = (details) => details;
  responseInterceptor: ResponseInterceptor = (result) => result;
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  readonly _isStream: boolean = false;
  totalMessagesMaxCharLength?: number;
  maxMessages?: number;
  readonly _isTextOnly?: boolean;
  private readonly _serviceRequireFiles: boolean;
  demo?: Demo;

  constructor(aiAssistant: AiAssistant, defaultFileTypes?: ServiceFileTypes, demo?: Demo) {
    this.demo = demo;
    Object.assign(this.rawBody, aiAssistant.request?.body);
    const {request, validateMessageBeforeSending, requestInterceptor, responseInterceptor} = aiAssistant;
    this._isStream = !!aiAssistant.stream;
    this.totalMessagesMaxCharLength = aiAssistant?.requestBodyMessageLimits?.totalMessagesMaxCharLength;
    this.maxMessages = aiAssistant?.requestBodyMessageLimits?.maxMessages;
    if (validateMessageBeforeSending) this.canSendMessage = validateMessageBeforeSending;
    BaseServiceIO.populateDefaultFileIO(defaultFileTypes?.audio, '.4a,.mp3,.webm,.mp4,.mpga,.wav,.mpeg,.m4a');
    BaseServiceIO.populateDefaultFileIO(defaultFileTypes?.images, '.png,.jpg');
    SetFileTypes.set(aiAssistant, this, defaultFileTypes);
    if (request) this.requestSettings = request;
    if (requestInterceptor) this.requestInterceptor = requestInterceptor;
    if (responseInterceptor) this.responseInterceptor = responseInterceptor;
    this._serviceRequireFiles = !!defaultFileTypes && Object.keys(defaultFileTypes).length > 0;
    // WORK - this will not be required
    this._isTextOnly = !this.camera && !this.recordAudio && Object.keys(this.fileTypes).length === 0;
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

  verifyKey(_key: string, _keyVerificationHandlers: KeyVerificationHandlers) {}

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
    const body = {messages: pMessages, ...this.rawBody};
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
    const formData = BaseServiceIO.createCustomFormDataBody(body, pMessages, files);
    const previousRequestSettings = this.requestSettings;
    const fileIO = this.getServiceIOByType(files[0]);
    this.requestSettings = fileIO?.request || this.requestSettings;
    HTTPRequest.request(this, formData, messages, completionsHandlers.onFinish, false);
    this.requestSettings = previousRequestSettings;
  }

  // prettier-ignore
  callAPI(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    const processedMessages = MessageLimitUtils.processMessages(
      messages.messages, 0, this.maxMessages, this._isTextOnly ? this.totalMessagesMaxCharLength : undefined);
    if (files && !this._serviceRequireFiles) {
      this.callApiWithFiles(this.rawBody, messages, completionsHandlers, processedMessages, files);
    } else {
      this.callServiceAPI(messages, processedMessages, completionsHandlers, streamHandlers, files);
    }
  }

  async extractResultData(result: any | CustomServiceResponse): Promise<Result | {pollingInAnotherRequest: true}> {
    if (result.error) throw result.error;
    return result.result as Result;
  }
}
