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
    const kimiResult = result as KimiErrorResponse;
    if (kimiResult.error) {
      if (kimiResult.error.type === AUTHENTICATION_ERROR_PREFIX) {
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
      method: GET,
      handleVerificationResult: KimiUtils.handleVerificationResult,
    };
  }
}
