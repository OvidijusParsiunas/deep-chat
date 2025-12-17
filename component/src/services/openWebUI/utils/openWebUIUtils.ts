import {AUTHORIZATION_H, CONTENT_TYPE_H_KEY, GET, APPLICATION_JSON} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';

export const OPEN_WEB_UI_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `Bearer ${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const handleVerificationResult = (
  result: object,
  _key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const openWebUIResult = result as {detail?: string};
  if (openWebUIResult.detail) {
    onFail(openWebUIResult.detail);
  } else {
    onSuccess(_key);
  }
};

export const OPEN_WEB_UI_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('http://localhost:3000/api/v1/models', GET, handleVerificationResult);
};
