import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
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

export const TOGETHER_BUILD_HEADERS = (key?: string) => {
  return {
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
  };
};

const handleVerificationResult = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const togetherResult = result as TogetherErrorResponse;
  if (togetherResult.error) {
    if (togetherResult.error.message === UNAUTHORIZED) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const TOGETHER_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.together.xyz/v1/models', GET, handleVerificationResult);
};
