import {APPLICATION_JSON, AUTHENTICATION_ERROR_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ERROR} from '../../../utils/consts/messageConstants';

type ClaudeErrorResponse = {
  error?: {
    type: string;
    message: string;
  };
};

export const CLAUDE_BUILD_HEADERS = (key: string) => {
  return {
    'x-api-key': key,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
};

const handleVerificationResult = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const claudeResult = result as ClaudeErrorResponse;
  if (claudeResult[ERROR]) {
    if (claudeResult[ERROR].type === AUTHENTICATION_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const CLAUDE_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.anthropic.com/v1/models', GET, handleVerificationResult);
};
