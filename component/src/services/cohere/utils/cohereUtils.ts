import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {CohereCompletionsResult} from '../../../types/cohereResult';

export class CohereUtils {
  public static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const cohereResult = result as CohereCompletionsResult;
    // if the token is valid - it will simply error out that the prompt is wrong
    // using this approach to not cost anything to the user
    if (cohereResult.message?.includes('invalid request: prompt must be at least 1 token long')) {
      onSuccess(key);
    } else {
      onFail(ErrorMessages.INVALID_KEY);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.cohere.ai/v1/generate',
      method: 'POST',
      handleVerificationResult: CohereUtils.handleVerificationResult,
      body: JSON.stringify({prompt: ''}),
    };
  }
}
