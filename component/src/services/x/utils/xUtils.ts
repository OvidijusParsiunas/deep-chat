import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {
  INVALID_REQUEST_ERROR_PREFIX,
  AUTHENTICATION_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

type XErrorResponse = {
  error?: {
    type: string;
    message: string;
  };
};

export class XUtils {
  public static buildHeaders(key: string) {
    return {
      Authorization: `${BEARER_PREFIX}${key}`,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
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
      if (xResult.error.type === AUTHENTICATION_ERROR_PREFIX || xResult.error.type === INVALID_REQUEST_ERROR_PREFIX) {
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
      url: 'https://api.x.ai/v1/models',
      method: GET,
      handleVerificationResult: XUtils.handleVerificationResult,
    };
  }
}
