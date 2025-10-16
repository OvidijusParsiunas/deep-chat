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

type BigModelErrorResponse = {
  error?: {
    message: string;
  };
};

export class BigModelUtils {
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
    const bigModelResult = result as BigModelErrorResponse;
    if (bigModelResult.error) {
      if (bigModelResult.error.message === UNAUTHORIZED) {
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
      url: 'https://open.bigmodel.cn/api/paas/v4/models',
      method: GET,
      handleVerificationResult: BigModelUtils.handleVerificationResult,
    };
  }
}
