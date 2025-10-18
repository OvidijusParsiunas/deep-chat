import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR} from '../../../utils/consts/messageConstants';
import {
  INVALID_REQUEST_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

type QwenErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export const QWEN_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const handleVerificationResult = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const qwenResult = result as QwenErrorResponse;
  if (qwenResult[ERROR]) {
    if (qwenResult[ERROR].type === INVALID_REQUEST_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const QWEN_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(
    'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models',
    GET,
    handleVerificationResult
  );
};
