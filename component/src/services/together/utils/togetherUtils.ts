import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  UNAUTHORIZED,
  GET,
} from '../../utils/serviceConstants';

type TogetherErrorResponse = {
  error?: {
    message: string;
  };
};

export class TogetherUtils {
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
    const togetherResult = result as TogetherErrorResponse;
    if (togetherResult.error) {
      if (togetherResult.error.message === UNAUTHORIZED) {
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
      method: GET,
      handleVerificationResult: TogetherUtils.handleVerificationResult,
    };
  }
}
