import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {ServiceIO} from '../../services/serviceIO';
import {Demo} from '../demo/demo';

// prettier-ignore
export type HandleVerificationResult = (
  result: object, key: string, onSuccess: (key: string) => void, onFail: (message: string) => void) => void;

type Finish = () => void;

export class HTTPRequest {
  public static request(io: ServiceIO, body: object, messages: Messages, onFinish: Finish, stringifyBody = true) {
    if (io.requestSettings?.url === Demo.URL) return Demo.request(messages, onFinish);
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders} = io.requestInterceptor(requestDetails);
    fetch(io.requestSettings?.url || io.url || '', {
      method: io.requestSettings?.method || 'POST',
      headers: interceptedHeaders,
      body: stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody,
    })
      .then((response) => HTTPRequest.processResponseByType(response))
      .then(async (result: object) => {
        if (!io.extractResultData) return;
        const resultData = await io.extractResultData(io.resposeInterceptor(result));
        if (resultData.pollingInAnotherRequest) return;
        messages.addNewMessage(resultData, true, true);
        onFinish();
      })
      .catch((err) => {
        console.error(err);
        messages.addNewErrorMessage('service', err);
        onFinish();
      });
  }

  // prettier-ignore
  public static requestStream(io: ServiceIO, body: object, messages: Messages,
      onOpen: () => void, onClose: () => void, abortStream: AbortController, stringifyBody = true) {
    if (io.requestSettings?.url === Demo.URL) return Demo.requestStream(messages, onOpen, onClose);
    let textElement: HTMLElement | null = null;
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders} = io.requestInterceptor(requestDetails);
    fetchEventSource(io.requestSettings?.url || io.url || '', {
      method: io.requestSettings?.method || 'POST',
      headers: interceptedHeaders,
      body: stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody,
      openWhenHidden: true, // keep stream open when browser tab not open
      async onopen(response: Response) {
        if (response.ok) {
          textElement = messages.addNewStreamedMessage();
          return onOpen();
        }
        messages.addNewErrorMessage('service');
        onClose();
        throw new Error('error');
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as OpenAIConverseResult;
          io.extractResultData?.(response).then((text) => {
            if (textElement) messages.updateStreamedMessage(text.text as string, textElement);            
          });
        }
      },
      onerror(err) {
        console.error(err);
        messages.addNewErrorMessage('service', err);
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
  public static executePollRequest(io: ServiceIO,
      url: string, requestInit: RequestInit, messages: Messages, onFinish: Finish) {
    console.log('polling');
    fetch(url, requestInit)
      .then((response) => response.json())
      .then(async (result: object) => {
        if (!io.extractPollResultData) return;
        const resultData = await io.extractPollResultData(io.resposeInterceptor(result));
        if (resultData.timeoutMS) {
          setTimeout(() => {
            HTTPRequest.executePollRequest(io, url, requestInit, messages, onFinish);            
          }, resultData.timeoutMS);
        } else {
          console.log('finished polling');
          messages.addNewMessage(resultData, true, true);
          onFinish();
        }
      })
      .catch((err) => {
        console.log('caught an error');
        console.error(err);
        messages.addNewErrorMessage('service', err);
        onFinish();
      });
  }

  public static poll(io: ServiceIO, body: object, messages: Messages, onFinish: Finish, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers} = io.requestInterceptor(requestDetails);
    const url = io.requestSettings?.url || io.url || '';
    const method = io.requestSettings?.method || 'POST';
    const requestBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    const requestInit = {method, body: requestBody, headers};
    HTTPRequest.executePollRequest(io, url, requestInit, messages, onFinish);
  }

  // prettier-ignore
  public static verifyKey(key: string, url: string, headers: HeadersInit, method: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void,
      handleVerificationResult: HandleVerificationResult, body?: string) {
    if (key === '') return onFail(ErrorMessages.INVALID_KEY);
    onLoad();
    fetch(url, {
      method,
      headers,
      body: body || null,
    })
      .then((response) => HTTPRequest.processResponseByType(response))
      .then((result: object) => {
        handleVerificationResult(result, key, onSuccess, onFail);
      })
      .catch((err) => {
        onFail(ErrorMessages.CONNECTION_FAILED);
        console.error(err);
      });
  }

  private static processResponseByType(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    // when no contentType - the response is returned primarily for azure summarization to allow examination of headers
    if (contentType?.includes('text/plain') || !contentType) {
      return response;
    }
    return response.blob();
  }
}
