import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {HuggingFaceTextGenerationResult} from '../../../types/huggingFaceResult';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {ERROR} from '../../../utils/consts/messageConstants';

export const HUGGING_FACE_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON, // bigcode/santacoder expects this so adding just-in-case
  };
};

// prettier-ignore
const handleVerificationResult = (result: object, key: string,
    onSuccess: (key: string) => void, onFail: (message: string) => void) => {
  const huggingFaceResult = result as HuggingFaceTextGenerationResult;
  // if the token is valid - it will simply error out that the pameters are required
  if (Array.isArray(huggingFaceResult[ERROR]) && huggingFaceResult[ERROR][0] === 'Error in `parameters`: field required') {
    onSuccess(key);
  } else {
    onFail(INVALID_KEY);
  }
};

export const HUGGING_FACE_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(
    'https://api-inference.huggingface.co/models/gpt2',
    POST,
    handleVerificationResult
  );
};
