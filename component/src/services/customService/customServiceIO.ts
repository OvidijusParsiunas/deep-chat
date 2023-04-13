import {CompletionsHandlers, KeyVerificationHandlers, ServiceIO, StreamHandlers} from '../serviceIO';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {CustomServiceResponse} from '../../types/customService';
import {OpenAIBodyInternal} from '../../types/openAIInternal';
import {Messages} from '../../views/chat/messages/messages';
import {RequestSettings} from '../../types/requestSettings';
import {HTTPRequest} from '../../utils/HTTP/HTTPRequest';
import {MessageContent} from '../../types/messages';
import {AiAssistant} from '../../aiAssistant';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CustomServiceIO implements ServiceIO<any, CustomServiceResponse> {
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

  preprocessBody(_: OpenAIBodyInternal, messages: MessageContent[]) {
    return {messages};
  }

  // prettier-ignore
  callApi(messages: Messages, completionsHandlers: CompletionsHandlers, streamHandlers: StreamHandlers) {
    if (!this.requestSettings) throw new Error('Request settings have not been set up');
    if (this._config.stream) {
      HTTPRequest.requestStreamCompletion(this, this._config, messages, this._requestInterceptor,
        streamHandlers.onOpen, streamHandlers.onClose, streamHandlers.abortStream);
    } else {
      HTTPRequest.requestCompletion(this, this._config, messages, this._requestInterceptor,
        completionsHandlers.onFinish);
    }
  }

  extractTextFromResult(result: CustomServiceResponse): string {
    if (result.error) throw result.error;
    return result.aiMessage;
  }
}
