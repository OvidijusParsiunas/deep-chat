import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type ClaudeErrorResponse = {
  error?: {
    type: string;
    message: string;
  };
};

export class ClaudeUtils {
  public static buildHeaders(key: string) {
    return {
      'x-api-key': key,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
  }

  public static handleVerificationResult(
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) {
    const claudeResult = result as ClaudeErrorResponse;
    if (claudeResult.error) {
      if (claudeResult.error.type === 'authentication_error') {
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
      url: 'https://api.anthropic.com/v1/models',
      method: 'GET',
      handleVerificationResult: ClaudeUtils.handleVerificationResult,
    };
  }
}
