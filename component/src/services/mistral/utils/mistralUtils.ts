import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {MistralResult} from '../../../types/mistralRsult';

export class MistralUtils {
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
    const mistralResult = result as MistralResult;
    // if the token is valid - it will simply error out that the prompt is wrong
    // using this approach to not cost anything to the user
    if (mistralResult.detail) {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.mistral.ai/v1/models',
      method: 'GET',
      handleVerificationResult: MistralUtils.handleVerificationResult,
    };
  }
}
