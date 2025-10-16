import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  UNAUTHORIZED,
  GET,
} from '../../utils/serviceConstants';

type GroqErrorResponse = {
  error?: {
    message: string;
  };
};

export class GroqUtils {
  public static buildHeaders(key?: string) {
    return {
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
      [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
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
      if (groqResult.error.message === UNAUTHORIZED) {
        onFail(INVALID_KEY);
      } else {
        onFail(CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.groq.com/openai/v1/models',
      method: GET,
      handleVerificationResult: GroqUtils.handleVerificationResult,
    };
  }
}
