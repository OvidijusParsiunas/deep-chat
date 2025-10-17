import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {StabilityAITextToImageResult} from '../../../types/stabilityAIResult';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';

export const STABILITY_AI_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

// prettier-ignore
const handleVerificationResult = (result: object, key: string,
    onSuccess: (key: string) => void, onFail: (message: string) => void) => {
  const stabilityAIResult = result as StabilityAITextToImageResult;
  if (stabilityAIResult.message) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const STABILITY_AI_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.stability.ai/v1/engines/list', GET, handleVerificationResult);
};
