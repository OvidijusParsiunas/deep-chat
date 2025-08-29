import {HuggingFaceTextGenerationResult} from '../../../types/huggingFaceResult';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

export class HuggingFaceUtils {
  public static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', // bigcode/santacoder expects this so adding just-in-case
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const huggingFaceResult = result as HuggingFaceTextGenerationResult;
    // if the token is valid - it will simply error out that the pameters are required
    if (Array.isArray(huggingFaceResult.error) && huggingFaceResult.error[0] === 'Error in `parameters`: field required') {
      onSuccess(key);
    } else {
      onFail(ErrorMessages.INVALID_KEY);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api-inference.huggingface.co/models/gpt2',
      method: 'POST',
      handleVerificationResult: HuggingFaceUtils.handleVerificationResult,
    };
  }
}
