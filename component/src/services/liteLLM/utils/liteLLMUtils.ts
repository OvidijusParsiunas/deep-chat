import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
} from '../../utils/serviceConstants';

export const LITELLM_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

export const LITELLM_BUILD_KEY_VERIFICATION_DETAILS = (url: string): KeyVerificationDetails => {
  const modelsUrl = url.replace(/\/chat\/completions\/?$/, '/models');
  return BUILD_KEY_VERIFICATION_DETAILS(modelsUrl, 'GET', (result, key, onSuccess, onFail) => {
    const resultObj = result as {error?: {message: string}; data?: unknown[]};
    if (resultObj.error) {
      onFail(resultObj.error.message);
    } else {
      onSuccess(key);
    }
  });
};
