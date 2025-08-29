import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseI} from '../../types/response';
import {RequestDetails} from '../../types/interceptors';
import {ErrorResp} from '../../types/errorInternal';
import {ServiceIO} from '../../services/serviceIO';
import {GenericObject} from '../../types/object';
import {Connect} from '../../types/connect';
import {DeepChat} from '../../deepChat';

// this is mostly used for calling the request again for OpenAI API function calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FetchFunc = (body: any) => Promise<Response>;

export type InterceptorResult = RequestDetails & {error?: string};

type InterceptorResultP = Promise<InterceptorResult>;

interface RespProcessingOptions {
  io?: ServiceIO;
  useRI?: boolean;
  displayError?: boolean;
}

export class RequestUtils {
  public static readonly CONTENT_TYPE = 'Content-Type';

  // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
  // prettier-ignore
  public static async tempRemoveContentHeader(connectSettings: Connect | undefined,
      request: (stringifyBody?: boolean) => Promise<unknown>, stringifyBody: boolean) {
    if (!connectSettings?.headers) throw new Error('Request settings have not been set up');
    const previousContetType = connectSettings.headers[RequestUtils.CONTENT_TYPE];
    delete connectSettings.headers[RequestUtils.CONTENT_TYPE];
    let result;
    try {
      result = await request(stringifyBody);
    } catch (e) {
      connectSettings.headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      throw e;
    }
    connectSettings.headers[RequestUtils.CONTENT_TYPE] = previousContetType;
    return result;
  }

  public static displayError(messages: Messages, err: ErrorResp, defMessage = 'Service error, please try again.') {
    console.error(err);
    if (typeof err === 'object') {
      if (err instanceof Error) {
        return messages.addNewErrorMessage('service', err.message);
      }
      if (Array.isArray(err) || typeof err.error === 'string') {
        return messages.addNewErrorMessage('service', err);
      }
      if (Object.keys(err).length === 0) {
        return messages.addNewErrorMessage('service', defMessage);
      }
      return messages.addNewErrorMessage('service', JSON.stringify(err));
    }
    messages.addNewErrorMessage('service', err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fetch(io: ServiceIO, headers: GenericObject<string> | undefined, stringifyBody: boolean, body: any) {
    const requestContent: RequestInit = {method: io.connectSettings?.method || 'POST', headers};
    if (requestContent.method !== 'GET') requestContent.body = stringifyBody ? JSON.stringify(body) : body;
    if (io.connectSettings.credentials) requestContent.credentials = io.connectSettings.credentials;
    return fetch(io.connectSettings?.url || io.url || '', requestContent);
  }

  public static processResponseByType(response: Response) {
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
    messages.addNewErrorMessage('service', error);
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
