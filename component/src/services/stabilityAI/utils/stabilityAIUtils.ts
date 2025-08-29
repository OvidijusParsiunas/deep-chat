import {StabilityAITextToImageResult} from '../../../types/stabilityAIResult';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

export class StabilityAIUtils {
  public static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const stabilityAIResult = result as StabilityAITextToImageResult;
    if (stabilityAIResult.message) {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.stability.ai/v1/engines/list',
      method: 'GET',
      handleVerificationResult: StabilityAIUtils.handleVerificationResult,
    };
  }
}
