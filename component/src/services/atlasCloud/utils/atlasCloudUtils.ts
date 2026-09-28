import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {
  CONTENT_TYPE_H_KEY,
  APPLICATION_JSON,
  AUTHORIZATION_H,
  BEARER_PREFIX,
  POST,
} from '../../utils/serviceConstants';

// Atlas Cloud does not gate GET /v1/models behind auth (it returns 200 for
// any key), so key verification instead posts to /chat/completions, which
// authenticates the request before validating the (empty) body: an invalid
// key gets `{"code":401,...}` regardless of body content, while a valid key
// gets a non-401 response (typically 400 for the missing required fields).
type AtlasCloudErrorResponse = {
  code?: number;
  msg?: string;
};

export const ATLAS_CLOUD_BUILD_HEADERS = (key: string) => {
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
  const atlasCloudResult = result as AtlasCloudErrorResponse;
  if (atlasCloudResult.code === 401) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const ATLAS_CLOUD_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS('https://api.atlascloud.ai/v1/chat/completions', POST, handleVerificationResult);
};
