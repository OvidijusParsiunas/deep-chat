import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR} from '../../../utils/consts/messageConstants';
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

export const BIG_MODEL_BUILD_HEADERS = (key?: string) => {
  return {
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
  };
};

const BIG_MODEL_HANDLE_VERIFICATION_RESULT = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const bigModelResult = result as BigModelErrorResponse;
  if (bigModelResult[ERROR]) {
    if (bigModelResult[ERROR].message === UNAUTHORIZED) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const BIG_MODEL_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(
    'https://open.bigmodel.cn/api/paas/v4/models',
    GET,
    BIG_MODEL_HANDLE_VERIFICATION_RESULT
  );
};
