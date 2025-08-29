import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type BigModelErrorResponse = {
  error?: {
    message: string;
  };
};

export class BigModelUtils {
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
    const bigModelResult = result as BigModelErrorResponse;
    if (bigModelResult.error) {
      if (bigModelResult.error.message === 'Unauthorized') {
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
      url: 'https://open.bigmodel.cn/api/paas/v4/models',
      method: 'GET',
      handleVerificationResult: BigModelUtils.handleVerificationResult,
    };
  }
}