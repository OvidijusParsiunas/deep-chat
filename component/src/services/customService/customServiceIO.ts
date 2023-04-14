import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {CustomServiceResponse} from '../../types/customService';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {AiAssistant} from '../../aiAssistant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO {
  private readonly _config: any;
  requestSettings?: RequestSettings;
  private readonly _requestInterceptor: RequestInterceptor;

  constructor(aiAssistant: AiAssistant) {
    const {requestInterceptor, requestSettings, customService} = aiAssistant;
    this.requestSettings = requestSettings;
    this._requestInterceptor = requestInterceptor || ((body) => body);
    this._config = customService;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers) {}

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (this._config.stream) {
      HTTPRequest.requestStream(this, {stream: true, messages}, messages, this._requestInterceptor,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.request(this, {stream: false, messages}, messages, this._requestInterceptor,
        completionsHandlers.onFinish);
    }
  }

  extractResultData(result: CustomServiceResponse): string {
    if (result.error) throw result.error;
    return result.aiMessage;
  }
}
