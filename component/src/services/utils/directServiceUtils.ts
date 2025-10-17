import {KeyVerificationDetails} from '../../types/keyVerificationDetails';

export const BUILD_KEY_VERIFICATION_DETAILS = (
  url: string,
  method: string,
  handleVerificationResult: (
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) => void,
  augmentUrl?: (key: string) => string
): KeyVerificationDetails => {
  return {
    url,
    method,
    handleVerificationResult,
    augmentUrl,
  };
};
