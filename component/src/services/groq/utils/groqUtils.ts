import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type GroqErrorResponse = {
  error?: {
    message: string;
  };
};

export class GroqUtils {
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
    const groqResult = result as GroqErrorResponse;
    if (groqResult.error) {
      if (groqResult.error.message === 'Unauthorized') {
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
      url: 'https://api.groq.com/openai/v1/models',
      method: 'GET',
      handleVerificationResult: GroqUtils.handleVerificationResult,
    };
  }
}