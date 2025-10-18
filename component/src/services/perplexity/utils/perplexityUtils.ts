import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {ERROR} from '../../../utils/consts/messageConstants';

type PerplexityErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export const PERPLEXITY_BUILD_HEADERS = (key: string) => {
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
  const perplexityResult = result as PerplexityErrorResponse;
  if (perplexityResult[ERROR]) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const PERPLEXITY_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.perplexity.ai/chat/completions', POST, handleVerificationResult);
};
