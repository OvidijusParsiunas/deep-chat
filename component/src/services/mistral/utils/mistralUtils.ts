import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {MistralResult} from '../../../types/mistralResult';

export const MISTRAL_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    accept: APPLICATION_JSON,
  };
};

// prettier-ignore
const handleVerificationResult = (result: object, key: string,
    onSuccess: (key: string) => void, onFail: (message: string) => void) => {
  const mistralResult = result as MistralResult;
  // if the token is valid - it will simply error out that the prompt is wrong
  // using this approach to not cost anything to the user
  if (mistralResult.detail) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const MISTRAL_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.mistral.ai/v1/models', GET, handleVerificationResult);
};
