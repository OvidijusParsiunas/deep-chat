import {CONTENT_TYPE_H_KEY, APPLICATION_JSON, GET} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';

export const LITELLM_BUILD_HEADERS = () => {
  return {
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const handleVerificationResult = () => {};

export const LITELLM_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('', GET, handleVerificationResult);
};
