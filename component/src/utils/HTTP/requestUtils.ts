import {Messages} from '../../views/chat/messages/messages';
import {Request} from '../../types/request';

export class RequestUtils {
  public static readonly CONTENT_TYPE = 'Content-Type';

  // need to pass stringifyBody boolean separately as binding is throwing an error for some reason
  // prettier-ignore
  public static temporarilyRemoveHeader(requestSettings: Request | undefined,
      request: (stringifyBody?: boolean) => void, stringifyBody: boolean) {
    if (!requestSettings?.headers) throw new Error('Request settings have not been set up');
    const previousHeader = requestSettings.headers[RequestUtils.CONTENT_TYPE];
    delete requestSettings.headers[RequestUtils.CONTENT_TYPE];
    request(stringifyBody);
    requestSettings.headers[RequestUtils.CONTENT_TYPE] = previousHeader;
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
}
