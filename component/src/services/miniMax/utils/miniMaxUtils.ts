import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR, TYPE} from '../../../utils/consts/messageConstants';
import {
  AUTHENTICATION_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

type MiniMaxErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export const MINI_MAX_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const MINI_MAX_HANDLE_VERIFICATION_RESULT = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const miniMaxResult = result as MiniMaxErrorResponse;
  if (miniMaxResult[ERROR]) {
    if (miniMaxResult[ERROR][TYPE] === AUTHENTICATION_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.minimax.io/v1/models', GET, MINI_MAX_HANDLE_VERIFICATION_RESULT);
};
