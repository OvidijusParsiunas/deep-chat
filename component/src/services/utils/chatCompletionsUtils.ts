import {INVALID_KEY, CONNECTION_FAILED} from '../../utils/errorMessages/errorMessages';
import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {ChatCompletionsError} from '../../types/chatCompletionsResult';
import {ERROR, TYPE} from '../../utils/consts/messageConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from './directServiceUtils';
import {
  AUTHENTICATION_ERROR_PREFIX,
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  GET,
} from './serviceConstants';

export const CHAT_COMPLETIONS_BUILD_HEADERS = (key: string) => {
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
  const chatCompletionsResult = result as ChatCompletionsError;
  if (chatCompletionsResult[ERROR]) {
    if (chatCompletionsResult[ERROR][TYPE] === AUTHENTICATION_ERROR_PREFIX) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const CHAT_COMPLETIONS_BUILD_KEY_VERIFICATION_DETAILS = (url: string): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(url, GET, handleVerificationResult);
};
