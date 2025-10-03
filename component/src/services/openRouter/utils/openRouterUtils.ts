import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {
  AUTHENTICATION_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

type OpenRouterErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export class OpenRouterUtils {
  public static buildHeaders(key: string) {
    return {
      [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    };
  }

  public static handleVerificationResult(
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) {
    const openRouterResult = result as OpenRouterErrorResponse;
    if (openRouterResult.error) {
      if (openRouterResult.error.type === AUTHENTICATION_ERROR_PREFIX) {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onFail(ErrorMessages.CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    // Will return a 400 error, but it is fine as long as it is not 401
    return {
      url: 'https://openrouter.ai/api/v1/key',
      method: GET,
      handleVerificationResult: OpenRouterUtils.handleVerificationResult,
    };
  }
}
