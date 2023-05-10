import {RequestSettings} from '../../types/requestSettings';

export class RequestHeaderUtils {
  public static readonly CONTENT_TYPE = 'Content-Type';

  // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
  // prettier-ignore
  public static temporarilyRemoveContentType(requestSettings: RequestSettings | undefined,
      request: (stringifyBody?: boolean) => void, stringifyBody: boolean) {
    if (!requestSettings?.headers) throw new Error('Request settings have not been set up');
    const previousHeader = requestSettings.headers[RequestHeaderUtils.CONTENT_TYPE];
    delete requestSettings.headers[RequestHeaderUtils.CONTENT_TYPE];
    request(stringifyBody);
    requestSettings.headers[RequestHeaderUtils.CONTENT_TYPE] = previousHeader;
  }
}
