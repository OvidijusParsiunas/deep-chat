import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type MiniMaxErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
  base_resp?: {
    status_code: number;
  };
};

export class MiniMaxUtils {
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
    const miniMaxResult = result as MiniMaxErrorResponse;
    if (miniMaxResult.base_resp?.status_code === 1004) {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.minimax.io/v1/files/delete',
      method: POST,
      handleVerificationResult: MiniMaxUtils.handleVerificationResult,
    };
  }
}
