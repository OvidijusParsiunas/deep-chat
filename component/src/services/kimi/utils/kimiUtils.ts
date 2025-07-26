import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type KimiErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export class KimiUtils {
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
    const kimiResult = result as KimiErrorResponse;
    if (kimiResult.error) {
      if (kimiResult.error.type === 'authentication_error') {
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
      url: 'https://api.moonshot.ai/v1/models',
      method: 'GET',
      handleVerificationResult: KimiUtils.handleVerificationResult,
    };
  }
}
