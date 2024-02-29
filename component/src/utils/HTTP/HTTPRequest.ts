import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestDetails} from '../../types/interceptors';
import {ServiceIO} from '../../services/serviceIO';
import {CustomHandler} from './customHandler';
import {RequestUtils} from './requestUtils';
import {Demo} from '../demo/demo';
import {Stream} from './stream';

// prettier-ignore
export type HandleVerificationResult = (
  result: object, key: string, onSuccess: (key: string) => void, onFail: (message: string) => void) => void;

export class HTTPRequest {
  // prettier-ignore
  public static async request(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails: RequestDetails = {body, headers: io.connectSettings?.headers};
    const {body: interceptedBody, headers, error} =
      (await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails));
    const {onFinish} = io.completionsHandlers;
    if (error) return RequestUtils.onInterceptorError(messages, error, onFinish);
    if (io.connectSettings?.handler) return CustomHandler.request(io, interceptedBody, messages);
    if (io.connectSettings?.url === Demo.URL) return Demo.request(io, messages);
    let responseValid = true;
    const fetchFunc = RequestUtils.fetch.bind(this, io, headers, stringifyBody);
    fetchFunc(interceptedBody).then((response) => {
        responseValid = !!response.ok;
        return response;
      })
      .then((response) => RequestUtils.processResponseByType(response))
      .then(async (result: Response) => {
        if (!io.extractResultData) return; // this return should theoretically not execute
        const finalResult = (await io.deepChat.responseInterceptor?.(result)) || result;
        const resultData = await io.extractResultData(finalResult, fetchFunc, interceptedBody);
        // the reason why throwing here is to allow extractResultData to attempt extract error message and throw it
        if (!responseValid) throw result;
        if (!resultData || typeof resultData !== 'object')
          throw Error(ErrorMessages.INVALID_RESPONSE(result, 'response', !!io.deepChat.responseInterceptor, finalResult));
        if (resultData.makingAnotherRequest) return;
        if (Stream.isSimulatable(io.stream, resultData)) {
          Stream.simulate(messages, io.streamHandlers, resultData);
        } else {
          messages.addNewMessage(resultData);
          onFinish();
        }
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        onFinish();
      });
  }

  public static executePollRequest(io: ServiceIO, url: string, requestInit: RequestInit, messages: Messages) {
    // console.log('polling');
    const {onFinish} = io.completionsHandlers;
    fetch(url, requestInit)
      .then((response) => response.json())
      .then(async (result: object) => {
        if (!io.extractPollResultData) return;
        const resultData = await io.extractPollResultData((await io.deepChat.responseInterceptor?.(result)) || result);
        if (resultData.timeoutMS) {
          setTimeout(() => {
            HTTPRequest.executePollRequest(io, url, requestInit, messages);
          }, resultData.timeoutMS);
        } else {
          // console.log('finished polling');
          if (Stream.isSimulatable(io.stream, resultData)) {
            Stream.simulate(messages, io.streamHandlers, resultData);
          } else {
            messages.addNewMessage(resultData);
            onFinish();
          }
        }
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        onFinish();
      });
  }

  // prettier-ignore
  public static async poll(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.connectSettings?.headers};
    const {body: interceptedBody, headers, error} =
      (await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails));
    if (error) return RequestUtils.onInterceptorError(messages, error);
    const url = io.connectSettings?.url || io.url || '';
    const method = io.connectSettings?.method || 'POST';
    const requestBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    const requestInit: RequestInit = {method, body: requestBody, headers};
    if (io.connectSettings.credentials) requestInit.credentials = io.connectSettings.credentials; 
    HTTPRequest.executePollRequest(io, url, requestInit, messages);
  }

  // prettier-ignore
  public static verifyKey(key: string, url: string, headers: HeadersInit, method: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void,
      handleVerificationResult: HandleVerificationResult, body?: string) {
    if (key === '') return onFail(ErrorMessages.INVALID_KEY);
    onLoad();
    fetch(url, { method, headers, body: body || null })
      .then((response) => RequestUtils.processResponseByType(response))
      .then((result: object) => {
        handleVerificationResult(result, key, onSuccess, onFail);
      })
      .catch((err) => {
        onFail(ErrorMessages.CONNECTION_FAILED);
        console.error(err);
      });
  }
}
