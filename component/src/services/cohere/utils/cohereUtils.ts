import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {CohereChatResult} from '../../../types/cohereResult';

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
    const cohereResult = result as CohereChatResult;
    // if the token is valid - it will simply error out that the prompt is wrong
    // using this approach to not cost anything to the user
    if (typeof cohereResult.message === 'string') {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.cohere.ai/v1/models',
      method: 'GET',
      handleVerificationResult: CohereUtils.handleVerificationResult,
    };
  }
}
