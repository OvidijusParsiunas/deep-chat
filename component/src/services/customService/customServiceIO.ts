import {CameraFilesServiceConfig, MicrophoneFilesServiceConfig} from '../../types/fileServiceConfigs';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CustomServiceConfig, CustomServiceResponse} from '../../types/customService';
import {RequestInterceptor, ResponseInterceptor} from '../../types/interceptors';
import {PermittedErrorMessage} from '../../types/permittedErrorMessage';
import {RequestBodyMessageLimits} from '../../types/chatLimits';
import {MessageLimitUtils} from '../utils/messageLimitUtils';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {Demo as DemoClass} from '../../utils/demo/demo';
import {MessageContent} from '../../types/messages';
import {SetFileTypes} from '../utils/setFileTypes';
import {AiAssistant} from '../../aiAssistant';
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

// WORK - this should be defaulted to when no pre-existing service is defined
// GCP should be included here
/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  readonly raw_body: any;
  fileTypes: ServiceFileTypes = {};
  camera?: CameraFilesServiceConfig;
  recordAudio?: MicrophoneFilesServiceConfig;
  canSendMessage: ValidateMessageBeforeSending = CustomServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  private readonly displayServiceErrorMessages?: boolean;
  requestInterceptor: RequestInterceptor = (body) => body;
  responseInterceptor: ResponseInterceptor = (result) => result;
  private readonly _isStream: boolean = false;
  private readonly totalMessagesMaxCharLength?: number;
  private readonly maxMessages?: number;
  private readonly _isTextOnly?: boolean;
  demo?: Demo;
  validateConfigKey = false;

  constructor(aiAssistant: AiAssistant) {
    const customService = aiAssistant.service?.custom as CustomServiceConfig;
    if (!aiAssistant?.request && !customService?.demo) {
      throw new Error('please define a request property in custom: {request: ...}');
    }
    this.demo = customService.demo;
    if (this.demo) this.requestSettings.url = DemoClass.URL;
    if (aiAssistant.request) this.requestSettings = aiAssistant.request;
    if (aiAssistant.requestInterceptor) this.requestInterceptor = aiAssistant.requestInterceptor;
    if (aiAssistant.responseInterceptor) this.responseInterceptor = aiAssistant.responseInterceptor;
    SetFileTypes.set(aiAssistant, this);
    this.displayServiceErrorMessages = customService?.displayServiceErrorMessages;
    this._isStream = !!customService?.stream;
    this.totalMessagesMaxCharLength = aiAssistant?.requestBodyMessageLimits?.totalMessagesMaxCharLength;
    this.maxMessages = aiAssistant?.requestBodyMessageLimits?.maxMessages;
    if (customService) CustomServiceIO.cleanConfig(customService as Partial<CustomServiceConfig>);
    this.raw_body = customService;
    this._isTextOnly = !this.camera && !this.recordAudio && Object.keys(this.fileTypes).length === 0;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
  }

  private static cleanConfig(config: Partial<CustomServiceConfig> & RequestBodyMessageLimits) {
    delete config.stream;
    delete config.displayServiceErrorMessages;
    delete config.maxMessages;
    delete config.totalMessagesMaxCharLength;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(_key: string, _keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createFormDataBodya(body: any, messages: MessageContent[], files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`file${index + 1}`, file));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    let textMessageIndex = 0;
    messages.forEach((message) => {
      if (message.text) formData.append(`message${(textMessageIndex += 1)}`, JSON.stringify(message));
    });
    return formData;
  }

  // prettier-ignore
  private callApiWithFiles(messages: Messages, completionsHandlers: CompletionsHandlers,
      pMessages: MessageContent[], files: File[], fileIO?: FileServiceIO) {
    const formData = CustomServiceIO.createFormDataBodya(this.raw_body, pMessages, files);
    const previousRequestSettings = this.requestSettings;
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
    if (files) {
      const fileIO = this.getServiceIOByType(files[0]);
      this.callApiWithFiles(messages, completionsHandlers, processedMessages, files, fileIO);
    } else {
      const body = {messages: processedMessages, ...this.raw_body};
      if (this._isStream) {
        HTTPRequest.requestStream(this, body, messages,
          streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
      } else {
        HTTPRequest.request(this, body, messages, completionsHandlers.onFinish);
      }
    }
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

  async extractResultData(result: CustomServiceResponse): Promise<Result> {
    if (result.error) {
      if (this.displayServiceErrorMessages) {
        // eslint-disable-next-line no-throw-literal
        throw {permittedErrorMessage: result.error} as PermittedErrorMessage;
      }
      throw result.error;
    }
    return result.result as Result;
  }
}
