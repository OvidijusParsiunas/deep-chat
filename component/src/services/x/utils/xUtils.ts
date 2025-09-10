import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type XErrorResponse = {
  error?: {
    type: string;
    message: string;
  };
};

export class XUtils {
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
    const xResult = result as XErrorResponse;
    if (xResult.error) {
      if (xResult.error.type === 'authentication_error' || xResult.error.type === 'invalid_request_error') {
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
      url: 'https://api.x.ai/v1/models',
      method: 'GET',
      handleVerificationResult: XUtils.handleVerificationResult,
    };
  }
}
