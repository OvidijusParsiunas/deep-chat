import {CompletionsHandlers, ImagesConfig, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RemarkableConfig} from '../../views/chat/messages/remarkable/remarkableConfig';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {CustomServiceResponse} from '../../types/customService';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {FileAttachments} from '../../types/fileAttachments';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  private readonly _raw_body: any;
  images: ImagesConfig | undefined;
  canSendMessage: ValidateMessageBeforeSending = CustomServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant) {
    const {requestInterceptor, requestSettings, customService} = aiAssistant;
    if (requestSettings) this.requestSettings = requestSettings;
    this.requestInterceptor = requestInterceptor || ((body) => body);
    if (customService?.images) this.images = CustomServiceIO.preprocessImageBodyConfig(customService.images);
    this._raw_body = customService;
  }

  private static canSendMessage(text: string, files?: File[]) {
    return !files?.[0] || text.trim() !== '';
  }

  private static preprocessImageBodyConfig(config: FileAttachments) {
    const imagesConfig: ImagesConfig = {};
    if (config.infoModal) {
      imagesConfig.infoModal = config.infoModal;
      if (config.infoModal?.textMarkDown) {
        const remarkable = RemarkableConfig.createNew();
        imagesConfig.infoModal.textMarkDown = remarkable.render(config.infoModal?.textMarkDown);
      }
    }
    if (config.acceptedFormats) imagesConfig.acceptedFormats = config.acceptedFormats;
    if (config.maxNumberOfFiles) imagesConfig.maxNumberOfFiles = config.maxNumberOfFiles;
    delete config.infoModal;
    delete config.acceptedFormats;
    delete config.maxNumberOfFiles;
    return imagesConfig;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createFormDataBody(body: any, files: File[]) {
    const formData = new FormData();
    files.forEach((image, index) => formData.append(`image${index + 1}`, image));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    return formData;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, completionsHandlers: CompletionsHandlers, files: File[]) {
    const formData = CustomServiceIO.createFormDataBody(this._raw_body, files);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
    // imageInputElement.value = ''; // resetting to prevent Chrome issue of not being able to upload same file twice
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers, files?: File[]) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (files) {
      this.callApiWithImage(messages, completionsHandlers, files);
    } else if (this._raw_body.stream) {
      HTTPRequest.requestStream(this, {stream: true, messages}, messages,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, {stream: false, messages}, messages, completionsHandlers.onFinish);
    }
  }

  extractResultData(result: CustomServiceResponse): string {
    if (result.error) throw result.error;
    return result.aiMessage;
  }
}
