import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

type QwenErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export class QwenUtils {
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
    const qwenResult = result as QwenErrorResponse;
    if (qwenResult.error) {
      if (qwenResult.error.type === 'invalid_request_error') {
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
      url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models',
      method: 'GET',
      handleVerificationResult: QwenUtils.handleVerificationResult,
    };
  }
}
