import {CompletionsHandlers, FileServiceIO, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {CustomServiceConfig, CustomServiceResponse} from '../../types/customService';
import {PermittedErrorMessage} from '../../types/permittedErrorMessage';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  private readonly _raw_body: any;
  images: FileServiceIO | undefined;
  canSendMessage: ValidateMessageBeforeSending = CustomServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  private readonly displayServiceErrorMessages?: boolean;
  requestInterceptor: RequestInterceptor = (body) => body;
  private readonly _isStream: boolean = false;

  constructor(aiAssistant: AiAssistant) {
    const {customService} = aiAssistant;
    if (customService?.request) this.requestSettings = customService.request;
    if (customService?.interceptor) this.requestInterceptor = customService.interceptor;
    if (customService?.images) this.images = CustomServiceIO.parseImagesConfig(customService.images, this.requestSettings);
    this.displayServiceErrorMessages = customService?.displayServiceErrorMessages;
    this._isStream = !!customService?.stream;
    if (customService) CustomServiceIO.cleanConfig(customService as Partial<CustomServiceConfig>);
    this._raw_body = customService;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !files?.[0] || text.trim() !== '';
  }

  private static parseImagesConfig(images: CustomServiceConfig['images'], requestSettings: RequestSettings) {
    const imagesConfig: FileServiceIO & {files: FileAttachments} = {files: {acceptedFormats: 'image/*'}};
    if (typeof images === 'object') {
      const {files, request, interceptor, button} = images;
      if (files) {
        if (files.infoModal) {
          imagesConfig.files.infoModal = files.infoModal;
          if (files.infoModal?.textMarkDown) {
            const remarkable = RemarkableConfig.createNew();
            imagesConfig.infoModalTextMarkUp = remarkable.render(files.infoModal.textMarkDown);
          }
        }
        if (files.acceptedFormats) {
          imagesConfig.files.acceptedFormats = files.acceptedFormats;
        } else {
          imagesConfig.files.acceptedFormats = 'image/*';
        }
        if (files.maxNumberOfFiles) imagesConfig.files.maxNumberOfFiles = files.maxNumberOfFiles;
        if (files.dragAndDrop) imagesConfig.files.dragAndDrop = files.dragAndDrop;
      }
      imagesConfig.button = button;
      imagesConfig.request = {
        headers: request?.headers || requestSettings.headers,
        method: request?.method || requestSettings.method,
        url: request?.url || requestSettings.url,
      };
      imagesConfig.interceptor = interceptor;
    }
    return imagesConfig;
  }

  private static cleanConfig(config: Partial<CustomServiceConfig>) {
    delete config.images;
    delete config.request;
    delete config.stream;
    delete config.interceptor;
    delete config.displayServiceErrorMessages;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(_inputElement: HTMLInputElement, _keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createFormDataBody(body: any, files: File[]) {
    const formData = new FormData();
    files.forEach((image, index) => formData.append(`image${index + 1}`, image));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    return formData;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, completionsHandlers: CompletionsHandlers, files: File[]) {
    const formData = CustomServiceIO.createFormDataBody(this._raw_body, files);
    const previousRequestSettings = this.requestSettings;
    this.requestSettings = this.images?.request || this.requestSettings;
    this.images?.interceptor?.({body: formData, headers: this.requestSettings.headers});
    HTTPRequest.request(this, formData, messages, completionsHandlers.onFinish, false);
    this.requestSettings = previousRequestSettings;
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
      imageFiles?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (imageFiles) {
      this.callApiWithImage(messages, completionsHandlers, imageFiles);
    } else if (this._isStream) {
      HTTPRequest.requestStream(this, {stream: true, messages}, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, {stream: false, messages}, messages, completionsHandlers.onFinish);
    }
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
