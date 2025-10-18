import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR} from '../../../utils/consts/messageConstants';
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

export const X_BUILD_HEADERS = (key: string) => {
  return {
    Authorization: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const handleVerificationResult = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const xResult = result as XErrorResponse;
  if (xResult[ERROR]) {
    if (xResult[ERROR].type === AUTHENTICATION_ERROR_PREFIX || xResult[ERROR].type === INVALID_REQUEST_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const X_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.x.ai/v1/models', GET, handleVerificationResult);
};
