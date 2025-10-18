import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';

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
  if (miniMaxResult.base_resp?.status_code === 1004) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const MINI_MAX_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(
    'https://api.minimax.io/v1/files/delete',
    POST,
    MINI_MAX_HANDLE_VERIFICATION_RESULT
  );
};
