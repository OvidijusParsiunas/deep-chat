import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';

export class OpenAIUtils {
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
