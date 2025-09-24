import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {CONTENT_TYPE_KEY} from '../../utils/serviceConstants';

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
      Authorization: `Bearer ${key}`,
      [CONTENT_TYPE_KEY]: 'application/json',
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
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.perplexity.ai/chat/completions',
      method: 'POST',
      handleVerificationResult: PerplexityUtils.handleVerificationResult,
    };
  }
}
