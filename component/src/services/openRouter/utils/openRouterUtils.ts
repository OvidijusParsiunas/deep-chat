import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR} from '../../../utils/consts/messageConstants';
import {
  AUTHENTICATION_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

type OpenRouterErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export const OPEN_ROUTER_BUILD_HEADERS = (key: string) => {
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
  const openRouterResult = result as OpenRouterErrorResponse;
  if (openRouterResult[ERROR]) {
    if (openRouterResult[ERROR].type === AUTHENTICATION_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const OPEN_ROUTER_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  // Will return a 400 error, but it is fine as long as it is not 401
  return BUILD_KEY_VERIFICATION_DETAILS('https://openrouter.ai/api/v1/key', GET, handleVerificationResult);
};
