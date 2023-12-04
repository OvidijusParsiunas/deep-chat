import {Messages} from '../../views/chat/messages/messages';
import {Response as ResponseT} from '../../types/response';
import {RequestDetails} from '../../types/interceptors';
import {ServiceIO} from '../../services/serviceIO';
import {GenericObject} from '../../types/object';
import {Request} from '../../types/request';
import {DeepChat} from '../../deepChat';

// this is mostly used for calling the request again for OpenAI API function calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FetchFunc = (body: any) => Promise<Response>;

type InterceptorResult = Promise<RequestDetails & {error?: string}>;

export class RequestUtils {
  public static readonly CONTENT_TYPE = 'Content-Type';

  // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
  // prettier-ignore
  public static async tempRemoveContentHeader(requestSettings: Request | undefined,
      request: (stringifyBody?: boolean) => Promise<unknown>, stringifyBody: boolean) {
    if (!requestSettings?.headers) throw new Error('Request settings have not been set up');
    const previousContetType = requestSettings.headers[RequestUtils.CONTENT_TYPE];
    delete requestSettings.headers[RequestUtils.CONTENT_TYPE];
    let result;
    try {
      result = await request(stringifyBody);
    } catch (e) {
      requestSettings.headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      throw e;
    }
    requestSettings.headers[RequestUtils.CONTENT_TYPE] = previousContetType;
    return result;
  }

  public static displayError(messages: Messages, err: object, defMessage = 'Service error, please try again.') {
    console.error(err);
    if (typeof err === 'object') {
      if (Object.keys(err).length === 0) {
        return messages.addNewErrorMessage('service', defMessage);
      }
      return messages.addNewErrorMessage('service', JSON.stringify(err));
    }
    messages.addNewErrorMessage('service', err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fetch(io: ServiceIO, headers: GenericObject<string> | undefined, stringifyBody: boolean, body: any) {
    const requestContent: RequestInit = {method: io.requestSettings?.method || 'POST', headers};
    if (requestContent.method !== 'GET') requestContent.body = stringifyBody ? JSON.stringify(body) : body;
    if (io.requestSettings.credentials) requestContent.credentials = io.requestSettings.credentials;
    return fetch(io.requestSettings?.url || io.url || '', requestContent);
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

  public static async processRequestInterceptor(deepChat: DeepChat, requestDetails: RequestDetails): InterceptorResult {
    const result = (await deepChat.requestInterceptor?.(requestDetails)) || requestDetails;
    const resReqDetails = result as RequestDetails;
    const resErrDetails = result as {error?: string};
    return {body: resReqDetails.body, headers: resReqDetails.headers, error: resErrDetails.error};
  }

  public static validateResponseFormat(response: ResponseT) {
    return (
      response &&
      typeof response === 'object' &&
      (typeof response.error === 'string' ||
        typeof response.text === 'string' ||
        typeof response.html === 'string' ||
        Array.isArray(response.files))
    );
  }
}
