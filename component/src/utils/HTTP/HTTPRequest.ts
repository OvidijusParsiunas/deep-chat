import {EventSourceMessage, fetchEventSource} from '@microsoft/fetch-event-source';
import {OpenAIConverseResult} from '../../types/openAIResult';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {ServiceIO} from '../../services/serviceIO';
import {RequestUtils} from './requestUtils';
import {Result} from '../../types/result';
import {Demo} from '../demo/demo';

// prettier-ignore
export type HandleVerificationResult = (
  result: object, key: string, onSuccess: (key: string) => void, onFail: (message: string) => void) => void;

export class HTTPRequest {
  public static request(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders} =
      io.deepChat.requestInterceptor?.(requestDetails) || requestDetails;
    const {onFinish} = io.completionsHandlers;
    if (io.requestSettings?.url === Demo.URL) return Demo.request(messages, onFinish, io.deepChat.responseInterceptor);
    let responseValid = true;
    fetch(io.requestSettings?.url || io.url || '', {
      method: io.requestSettings?.method || 'POST',
      headers: interceptedHeaders,
      body: stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody,
    })
      .then((response) => {
        responseValid = !!response.ok;
        return response;
      })
      .then((response) => HTTPRequest.processResponseByType(response))
      .then(async (result: Response) => {
        if (!io.extractResultData) return; // this return should theoretically not execute
        const finalResult = io.deepChat.responseInterceptor?.(result) || result;
        const resultData = await io.extractResultData(finalResult);
        // the reason why throwing here is to allow extractResultData to attempt extract error message and throw it
        if (!responseValid) throw result;
        if (!resultData)
          throw Error(ErrorMessages.INVALID_RESPONSE_FORMAT(result, !!io.deepChat.responseInterceptor, finalResult));
        if (resultData.pollingInAnotherRequest) return;
        messages.addNewMessage(resultData, true, true);
        onFinish();
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        onFinish();
      });
  }

  // TO-DO can potentially offer an option to simulate a stream where a response message can be streamed word by word;
  // this can also be used for websockets
  // prettier-ignore
  public static requestStream(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers: interceptedHeaders} =
      io.deepChat.requestInterceptor?.(requestDetails) || requestDetails;
    const {onOpen, onClose, abortStream} = io.streamHandlers;
    if (io.requestSettings?.url === Demo.URL) return Demo.requestStream(messages, onOpen, onClose);
    let textElement: HTMLElement | null = null;
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
        const result = await HTTPRequest.processResponseByType(response);
        throw result;
      },
      onmessage(message: EventSourceMessage) {
        if (JSON.stringify(message.data) !== JSON.stringify('[DONE]')) {
          const response = JSON.parse(message.data) as unknown as OpenAIConverseResult;
          io.extractResultData?.(response).then((textBody?: Result) => {
            if (!textBody?.text) {
              // strategy - do not to stop the stream on one message failure to give other messages a change to display
              console.error(`Response data: ${message.data} \n ${ErrorMessages.INVALID_STREAM_FORMAT}`);
            } else if (textElement) messages.updateStreamedMessage(textBody.text, textElement);            
          }).catch((e) => RequestUtils.displayError(messages, e));
        }
      },
      onerror(err) {
        onClose();
        throw err; // need to throw otherwise stream will retry infinitely
      },
      onclose() {
        messages.finaliseStreamedMessage();
        onClose();
      },
      signal: abortStream.signal,
    }).catch((err) => {
      // allowing extractResultData to attempt extract error message and throw it
      io.extractResultData?.(err).then(() => {
        RequestUtils.displayError(messages, err);
      }).catch((parsedError) => {
        RequestUtils.displayError(messages, parsedError);
      });
    });
  }

  // prettier-ignore
  public static executePollRequest(io: ServiceIO, url: string, requestInit: RequestInit, messages: Messages) {
    console.log('polling');
    const {onFinish} = io.completionsHandlers;
    fetch(url, requestInit)
      .then((response) => response.json())
      .then(async (result: object) => {
        if (!io.extractPollResultData) return;
        const resultData = await io.extractPollResultData(io.deepChat.responseInterceptor?.(result) || result);
        if (resultData.timeoutMS) {
          setTimeout(() => {
            HTTPRequest.executePollRequest(io, url, requestInit, messages);            
          }, resultData.timeoutMS);
        } else {
          console.log('finished polling');
          messages.addNewMessage(resultData, true, true);
          onFinish();
        }
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        onFinish();
      });
  }

  public static poll(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, headers} = io.deepChat.requestInterceptor?.(requestDetails) || requestDetails;
    const url = io.requestSettings?.url || io.url || '';
    const method = io.requestSettings?.method || 'POST';
    const requestBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    const requestInit = {method, body: requestBody, headers};
    HTTPRequest.executePollRequest(io, url, requestInit, messages);
  }

  // prettier-ignore
  public static verifyKey(key: string, url: string, headers: HeadersInit, method: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void,
      handleVerificationResult: HandleVerificationResult, body?: string) {
    if (key === '') return onFail(ErrorMessages.INVALID_KEY);
    onLoad();
    fetch(url, { method, headers, body: body || null })
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
