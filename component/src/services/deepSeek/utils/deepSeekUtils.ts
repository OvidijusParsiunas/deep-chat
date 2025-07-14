import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';

type DeepSeekErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export class DeepSeekUtils {
  public static buildHeaders(key: string) {
    return {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  public static handleVerificationResult(
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) {
    const deepSeekResult = result as DeepSeekErrorResponse;
    if (deepSeekResult.error) {
      if (deepSeekResult.error.type === 'authentication_error') {
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
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      handleVerificationResult: DeepSeekUtils.handleVerificationResult,
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