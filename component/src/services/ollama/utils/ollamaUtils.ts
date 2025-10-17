import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {GET} from '../../utils/serviceConstants';

export const OLLAMA_BUILD_HEADERS = () => {
  return {};
};

const handleVerificationResult = () => {};

export const OLLAMA_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('', GET, handleVerificationResult);
};
