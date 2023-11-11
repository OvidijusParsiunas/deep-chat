import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {Messages} from '../../../views/chat/messages/messages';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';

export class OpenAIUtils {
  // 13352 roughly adds up to 3,804 tokens just to be safe
  public static readonly CONVERSE_MAX_CHAR_LENGTH: number = 13352;
  public static readonly FILE_MAX_CHAR_LENGTH: number = 1000;

  public static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const openAIResult = result as OpenAIConverseResult;
    if (openAIResult.error) {
      if (openAIResult.error.code === 'invalid_api_key') {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onFail(ErrorMessages.CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.openai.com/v1/models',
      method: 'GET',
      handleVerificationResult: OpenAIUtils.handleVerificationResult,
    };
  }

  public static async storeFiles(serviceIO: ServiceIO, messages: Messages, files: File[]) {
    const headers = serviceIO.requestSettings.headers;
    if (!headers) return;
    serviceIO.url = `https://api.openai.com/v1/files`; // stores files
    const previousContetType = headers[RequestUtils.CONTENT_TYPE];
    delete headers[RequestUtils.CONTENT_TYPE];
    const requests = files.map(async (file) => {
      const formData = new FormData();
      formData.append('purpose', 'assistants');
      formData.append('file', file);
      return new Promise<{id: string}>((resolve) => {
        resolve(OpenAIUtils.directFetch(serviceIO, formData, 'POST', false)); // should perhaps use await but works without
      });
    });
    try {
      const fileIds = (await Promise.all(requests)).map((result) => result.id);
      headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      return fileIds;
    } catch (err) {
      headers[RequestUtils.CONTENT_TYPE] = previousContetType;
      // error handled here as files not sent using HTTPRequest.request to not trigger the interceptors
      RequestUtils.displayError(messages, err as object);
      serviceIO.completionsHandlers.onFinish();
      throw err;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async directFetch(serviceIO: ServiceIO, body: any, method: 'POST' | 'GET', stringify = true) {
    serviceIO.requestSettings.method = method;
    const result = await RequestUtils.fetch(serviceIO, serviceIO.requestSettings.headers, stringify, body).then((resp) =>
      RequestUtils.processResponseByType(resp)
    );
    if (result.error) throw result.error.message;
    return result;
  }
}
