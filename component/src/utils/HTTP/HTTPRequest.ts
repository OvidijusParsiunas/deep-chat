import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {RequestInterceptor} from '../../types/requestInterceptor';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {OpenAIResult} from '../../types/openAIResult';
import {ServiceIO} from '../../services/serviceIO';

// prettier-ignore
export type HandleVerificationResult = (
  result: object, key: string, onSuccess: (key: string) => void, onFail: (message: string) => void) => void;

export class HTTPRequest {
  // prettier-ignore
  public static requestCompletion(io: ServiceIO, baseBody: object, messages: Messages,
      requestInterceptor: RequestInterceptor, onFinish: () => void) {
    fetch(io.requestSettings?.url || io.url, {
      method: io.requestSettings?.method || 'POST',
      headers: io.requestSettings?.headers,
      body: JSON.stringify(requestInterceptor(io.preprocessBody(baseBody, messages))),
    })
      .then((response) => response.json())
      .then((result: OpenAIResult) => {
        const text = io.extractTextFromResult(result);
        messages.addNewMessage(text, true, true);
        onFinish();
      })
      .catch((err) => {
        console.error(err);
        messages.addNewErrorMessage('chat');
        onFinish();
      });
  }

  // prettier-ignore
  public static requestStreamCompletion(io: ServiceIO, baseBody: object, messages: Messages,
      requestInterceptor: RequestInterceptor, onOpen: () => void, onClose: () => void, abortStream: AbortController) {
    let textElement: HTMLElement | null = null;
    fetchEventSource(io.requestSettings?.url || io.url, {
      method: io.requestSettings?.method || 'POST',
      headers: io.requestSettings?.headers,
      body: JSON.stringify(requestInterceptor(io.preprocessBody(baseBody, messages))),
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          textElement = messages.addNewStreamedMessage();
          return onOpen();
        }
        messages.addNewErrorMessage('chat');
        onClose();
        throw new Error('error');
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as OpenAIResult;
          const text = io.extractTextFromResult(response);
          if (textElement) Messages.updateStreamedMessage(text, textElement);
        }
      },
      onerror(err) {
        console.error(err);
        messages.addNewErrorMessage('chat');
        onClose();
        throw new Error('error'); // need to throw otherwise stream will retry infinitely
      },
      onclose() {
        messages.finaliseStreamedMessage((textElement as HTMLElement)?.innerText);
        onClose();
      },
      signal: abortStream.signal,
    });
  }

  // prettier-ignore
  public static verifyKey(key: string, url: string, headers: HeadersInit,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void,
      handleVerificationResult: HandleVerificationResult) {
    if (key === '') return onFail(ErrorMessages.INVALID_KEY);
    onLoad();
    fetch(url, {
      method: 'GET',
      headers,
      body: null,
    })
      .then((response) => response.json())
      .then((result: object) => {
        handleVerificationResult(result, key, onSuccess, onFail);
      })
      .catch((err) => {
        onFail(ErrorMessages.CONNECTION_FAILED);
        console.error(err);
      });
  }
}
