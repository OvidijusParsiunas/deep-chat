import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {GeminiGenerateContentResult} from '../../../types/geminiResult';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';

export class GeminiUtils {
  public static buildHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const geminiResult = result as GeminiGenerateContentResult;
    if (geminiResult.error) {
      if (geminiResult.error.code === 403 || geminiResult.error.message?.includes('API key')) {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onFail(ErrorMessages.CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  // https://ai.google.dev/api/models#method:-models.list
  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=';
    return {
      url,
      augmentUrl: (key: string) => `${url}${key}`,
      method: 'GET',
      handleVerificationResult: GeminiUtils.handleVerificationResult,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async directFetch(serviceIO: ServiceIO, body: any, method: 'POST' | 'GET', stringify = true) {
    serviceIO.connectSettings.method = method;
    const result = await RequestUtils.fetch(serviceIO, serviceIO.connectSettings.headers, stringify, body).then((resp) =>
      RequestUtils.processResponseByType(resp)
    );
    if (result.error) throw result.error.message;
    return result;
  }
}
