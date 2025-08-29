import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

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
      Authorization: `Bearer ${key}`,
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
      url: 'https://api.deepseek.com/models',
      method: 'GET',
      handleVerificationResult: DeepSeekUtils.handleVerificationResult,
    };
  }
}
