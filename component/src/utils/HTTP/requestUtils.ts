import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, GET, OBJECT, POST} from '../../services/utils/serviceConstants';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {RequestDetails} from '../../types/interceptors';
import {ErrorResp} from '../../types/errorInternal';
import {ServiceIO} from '../../services/serviceIO';
import {SERVICE} from '../consts/messageConstants';
import {GenericObject} from '../../types/object';
import {Connect} from '../../types/connect';
import {DeepChat} from '../../deepChat';

export type InterceptorResult = RequestDetails & {error?: string};

type InterceptorResultP = Promise<InterceptorResult>;

interface RespProcessingOptions {
  io?: ServiceIO;
  useRI?: boolean;
  displayError?: boolean;
}

export class RequestUtils {
  // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
  // prettier-ignore
  public static async tempRemoveContentHeader(connectSettings: Connect | undefined,
      request: (stringifyBody?: boolean) => Promise<unknown>, stringifyBody: boolean) {
    if (!connectSettings?.headers) throw new Error(ErrorMessages.REQUEST_SETTINGS_ERROR);
    const previousContetType = connectSettings.headers[CONTENT_TYPE_H_KEY];
    delete connectSettings.headers[CONTENT_TYPE_H_KEY];
    let result;
    try {
      result = await request(stringifyBody);
    } catch (e) {
      connectSettings.headers[CONTENT_TYPE_H_KEY] = previousContetType;
      throw e;
    }
    connectSettings.headers[CONTENT_TYPE_H_KEY] = previousContetType;
    return result;
  }

  public static displayError(messages: Messages, err: ErrorResp, defMessage = 'Service error, please try again.') {
    console.error(err);
    if (typeof err === OBJECT) {
      if (err instanceof Error) {
        return messages.addNewErrorMessage(SERVICE, err.message);
      }
      if (Array.isArray(err) || typeof (err as {error?: string}).error === 'string') {
        return messages.addNewErrorMessage(SERVICE, err);
      }
      if (Object.keys(err).length === 0) {
        return messages.addNewErrorMessage(SERVICE, defMessage);
      }
      return messages.addNewErrorMessage(SERVICE, JSON.stringify(err));
    }
    messages.addNewErrorMessage(SERVICE, err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fetch(io: ServiceIO, headers: GenericObject<string> | undefined, stringifyBody: boolean, body: any) {
    const requestContent: RequestInit = {method: io.connectSettings?.method || POST, headers};
    if (requestContent.method !== GET) requestContent.body = stringifyBody ? JSON.stringify(body) : body;
    if (io.connectSettings.credentials) requestContent.credentials = io.connectSettings.credentials;
    return fetch(io.connectSettings?.url || io.url || '', requestContent);
  }

  public static processResponseByType(response: Response) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes(APPLICATION_JSON)) {
      return response.json();
    }
    // when no contentType - the response is returned primarily for azure summarization to allow examination of headers
    if (contentType?.includes('text/plain') || !contentType) {
      return response;
    }
    return response.blob();
  }

  public static async processRequestInterceptor(deepChat: DeepChat, requestDetails: RequestDetails): InterceptorResultP {
    const result = (await deepChat.requestInterceptor?.(requestDetails)) || requestDetails;
    const resReqDetails = result as RequestDetails;
    const resErrDetails = result as {error?: string};
    return {body: resReqDetails.body, headers: resReqDetails.headers, error: resErrDetails.error};
  }

  public static validateResponseFormat(response: ResponseI | ResponseI[], isStreaming: boolean) {
    if (!response) return false;
    const dataArr = Array.isArray(response) ? response : [response];
    if (isStreaming && dataArr.length > 1) {
      console.error(ErrorMessages.INVALID_STREAM_ARRAY_RESPONSE);
      return false;
    }
    const invalidFound = dataArr.find(
      (data) =>
        typeof data !== 'object' ||
        !(
          typeof data.error === 'string' ||
          typeof data.text === 'string' ||
          typeof data.html === 'string' ||
          Array.isArray(data.files)
        )
    );
    return !invalidFound;
  }

  public static onInterceptorError(messages: Messages, error: string, onFinish?: () => void) {
    messages.addNewErrorMessage(SERVICE, error);
    onFinish?.();
  }

  // prettier-ignore
  public static async basicResponseProcessing(
      messages: Messages, resp: ResponseI | ResponseI[], options: RespProcessingOptions = {}) {
    const {io, displayError = true, useRI = true} = options;
    if (!io?.extractResultData) return resp;
    const responseInterceptor = useRI ? io.deepChat.responseInterceptor : undefined;
    const result = (await responseInterceptor?.(resp)) || resp;
    const finalResult = await io.extractResultData(result);
    if (!finalResult || (typeof finalResult !== 'object' && !Array.isArray(finalResult))) {
      if (displayError) {
        const err = ErrorMessages.INVALID_RESPONSE(resp, 'response', !!responseInterceptor, result);
        RequestUtils.displayError(messages, err);
      }
      return undefined;
    }
    return finalResult;
  }
}
