import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {GeminiGenerateContentResult} from '../../../types/geminiResult';
import {ERROR} from '../../../utils/consts/messageConstants';

export const GEMINI_BUILD_HEADERS = () => {
  return {
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

// prettier-ignore
const handleVerificationResult = (result: object, key: string,
    onSuccess: (key: string) => void, onFail: (message: string) => void) => {
  const geminiResult = result as GeminiGenerateContentResult;
  if (geminiResult[ERROR]) {
    if (geminiResult[ERROR].code === 403 || geminiResult[ERROR].message?.includes('API key')) {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

// https://ai.google.dev/api/models#method:-models.list
export const GEMINI_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=';
  return BUILD_KEY_VERIFICATION_DETAILS(url, GET, handleVerificationResult, (key: string) => `${url}${key}`);
};
