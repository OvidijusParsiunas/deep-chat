import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  PLACEHOLDER_KEY,
  BEARER_PREFIX,
  GET,
} from '../../utils/serviceConstants';

export const LITELLM_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: key === PLACEHOLDER_KEY ? '' : `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const handleVerificationResult = () => {};

export const LITELLM_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('', GET, handleVerificationResult);
};
