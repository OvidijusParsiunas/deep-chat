import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CustomServiceConfig, CustomServiceResponse} from '../../types/customService';
import {PermittedErrorMessage} from '../../types/permittedErrorMessage';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {FilesServiceConfig} from '../../types/fileService';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';
import {
  KeyVerificationHandlers,
  CompletionsHandlers,
  ServiceFileTypes,
  StreamHandlers,
  FileServiceIO,
  ServiceIO,
} from '../serviceIO';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  private readonly _raw_body: any;
  fileTypes: ServiceFileTypes = {};
  camera?: FilesServiceConfig;
  canSendMessage: ValidateMessageBeforeSending = CustomServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  private readonly displayServiceErrorMessages?: boolean;
  requestInterceptor: RequestInterceptor = (body) => body;
  private readonly _isStream: boolean = false;

  constructor(aiAssistant: AiAssistant) {
    const {customService} = aiAssistant;
    if (!customService) return;
    if (customService.request) this.requestSettings = customService.request;
    if (customService.interceptor) this.requestInterceptor = customService.interceptor;
    if (customService.images) {
      this.fileTypes.images = CustomServiceIO.parseConfig(customService.images, this.requestSettings, 'image/*');
    }
    if (customService.camera) {
      if (navigator.mediaDevices.getUserMedia !== undefined) {
        this.camera = CustomServiceIO.parseConfig(customService.camera, this.requestSettings, 'image/*');
        // if camera is not available - fallback to normal image upload
      } else if (!customService.images) {
        this.fileTypes.images = CustomServiceIO.parseConfig(customService.camera, this.requestSettings, 'image/*');
      }
    }
    if (customService.audio) {
      this.fileTypes.audio = CustomServiceIO.parseConfig(customService.audio, this.requestSettings, 'audio/*');
      if (this.fileTypes.audio.files) this.fileTypes.audio.files.maxNumberOfFiles ??= this.camera?.files?.maxNumberOfFiles;
    }
    if (customService.anyFiles) {
      this.fileTypes.anyFiles = CustomServiceIO.parseConfig(customService.anyFiles, this.requestSettings, '');
    }
    this.displayServiceErrorMessages = customService?.displayServiceErrorMessages;
    this._isStream = !!customService?.stream;
    if (customService) CustomServiceIO.cleanConfig(customService as Partial<CustomServiceConfig>);
    this._raw_body = customService;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !!files?.[0] || text.trim() !== '';
  }

  // prettier-ignore
  private static parseConfig(fileType: boolean | FilesServiceConfig,
      requestSettings: RequestSettings, defAcceptedFormats: string) {
    const fileConfig: FileServiceIO & {files: FileAttachments} = {files: {acceptedFormats: defAcceptedFormats}};
    if (typeof fileType === 'object') {
      const {files, request, interceptor, button} = fileType;
      if (files) {
        if (files.infoModal) {
          fileConfig.files.infoModal = files.infoModal;
          if (files.infoModal?.textMarkDown) {
            const remarkable = RemarkableConfig.createNew();
            fileConfig.infoModalTextMarkUp = remarkable.render(files.infoModal.textMarkDown);
          }
        }
        if (files.acceptedFormats) fileConfig.files.acceptedFormats = files.acceptedFormats;
        if (files.maxNumberOfFiles) fileConfig.files.maxNumberOfFiles = files.maxNumberOfFiles;
        if (files.dragAndDrop) fileConfig.files.dragAndDrop = files.dragAndDrop;
      }
      fileConfig.button = button;
      fileConfig.request = {
        headers: request?.headers || requestSettings.headers,
        method: request?.method || requestSettings.method,
        url: request?.url || requestSettings.url,
      };
      fileConfig.interceptor = interceptor;
    }
    return fileConfig;
  }

  private static cleanConfig(config: Partial<CustomServiceConfig>) {
    delete config.images;
    delete config.camera;
    delete config.audio;
    delete config.anyFiles;
    delete config.request;
    delete config.stream;
    delete config.interceptor;
    delete config.displayServiceErrorMessages;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(_inputElement: HTMLInputElement, _keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createFormDataBody(body: any, files: File[]) {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`file${index + 1}`, file));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    return formData;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages,
      completionsHandlers: CompletionsHandlers, files: File[], fileIO?: FileServiceIO) {
    const formData = CustomServiceIO.createFormDataBody(this._raw_body, files);
    const previousRequestSettings = this.requestSettings;
    this.requestSettings = fileIO?.request || this.requestSettings;
    fileIO?.interceptor?.({body: formData, headers: this.requestSettings.headers});
    HTTPRequest.request(this, formData, messages, completionsHandlers.onFinish, false);
    this.requestSettings = previousRequestSettings;
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
      files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (files) {
      const fileIO = this.getServiceIOByType(files[0]);
      this.callApiWithImage(messages, completionsHandlers, files, fileIO);
    } else if (this._isStream) {
      HTTPRequest.requestStream(this, {stream: true, messages}, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, {stream: false, messages}, messages, completionsHandlers.onFinish);
    }
  }

  private getServiceIOByType(file: File) {
    if (file.type.startsWith('audio') && this.fileTypes.audio) {
      return this.fileTypes.audio;
    }
    if (file.type.startsWith('image') && this.fileTypes.images) {
      return this.fileTypes.images;
    }
    if (file.type.startsWith('image') && this.camera) {
      return this.camera;
    }
    return this.fileTypes.anyFiles;
  }

  extractResultData(result: CustomServiceResponse): string {
    if (result.error) {
      if (this.displayServiceErrorMessages) {
        // eslint-disable-next-line no-throw-literal
        throw {permittedErrorMessage: result.error} as PermittedErrorMessage;
      }
      throw result.error;
    }
    return result.aiMessage;
  }
}
