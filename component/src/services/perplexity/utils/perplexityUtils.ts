import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';

type PerplexityErrorResponse = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export class PerplexityUtils {
  public static buildHeaders(key: string) {
    return {
      [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    };
  }

  public static handleVerificationResult(
    result: object,
    key: string,
    onSuccess: (key: string) => void,
    onFail: (message: string) => void
  ) {
    const perplexityResult = result as PerplexityErrorResponse;
    if (perplexityResult.error) {
      onFail(INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.perplexity.ai/chat/completions',
      method: POST,
      handleVerificationResult: PerplexityUtils.handleVerificationResult,
    };
  }
}
