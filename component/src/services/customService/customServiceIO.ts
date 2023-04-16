import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {ValidateMessageBeforeSending} from '../../types/validateMessageBeforeSending';
import {RequestHeaderUtils} from '../../utils/HTTP/RequestHeaderUtils';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {CustomServiceResponse} from '../../types/customService';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  private readonly _raw_body: any;
  canSendMessage: ValidateMessageBeforeSending = CustomServiceIO.canSendMessage;
  requestSettings: RequestSettings = {};
  requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant) {
    const {requestInterceptor, requestSettings, customService} = aiAssistant;
    if (requestSettings) this.requestSettings = requestSettings;
    this.requestInterceptor = requestInterceptor || ((body) => body);
    this._raw_body = customService;
  }

  private static canSendMessage(text: string, files?: FileList | null) {
    return !files?.[0] || text.trim() !== '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {}

  private static createFormDataBody(body: any, images: FileList) {
    const formData = new FormData();
    Array.from(images).forEach((image, index) => formData.append(`image${index + 1}`, image));
    Object.keys(body).forEach((key) => formData.append(key, String(body[key])));
    return formData;
  }

  // prettier-ignore
  private callApiWithImage(messages: Messages, completionsHandlers: CompletionsHandlers,
      imageInputElement: HTMLInputElement) {
    if (!imageInputElement?.files) throw new Error('No file was present');
    const formData = CustomServiceIO.createFormDataBody(this._raw_body, imageInputElement.files);
    // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
    RequestHeaderUtils.temporarilyRemoveContentType(this.requestSettings,
      HTTPRequest.request.bind(this, this, formData, messages, completionsHandlers.onFinish), false);
    imageInputElement.value = ''; // resetting to prevent Chrome issue of not being able to upload same file twice
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers,
      imageInputElement?: HTMLInputElement) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (imageInputElement?.files) {
      this.callApiWithImage(messages, completionsHandlers, imageInputElement);
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
