import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type TogetherErrorResponse = {
  error?: {
    message: string;
  };
};

export class TogetherUtils {
  public static buildHeaders(key?: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    };
  }

  public static handleVerificationResult(
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) {
    const togetherResult = result as TogetherErrorResponse;
    if (togetherResult.error) {
      if (togetherResult.error.message === 'Unauthorized') {
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
      url: 'https://api.together.xyz/v1/models',
      method: 'GET',
      handleVerificationResult: TogetherUtils.handleVerificationResult,
    };
  }
}
