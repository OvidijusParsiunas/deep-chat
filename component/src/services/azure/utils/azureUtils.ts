import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {AzureKeyRetrievalResult} from '../../../types/azureResult';

export class AzureUtils {
  public static buildHeaders(key: string) {
    return {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const azureResult = result as AzureKeyRetrievalResult;
    if (azureResult.error) {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(region: string): KeyVerificationDetails {
    return {
      url: `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
      method: 'POST',
      createHeaders: (key: string) => {
        return {'Ocp-Apim-Subscription-Key': `${key}`};
      },
      handleVerificationResult: AzureUtils.handleVerificationResult,
    };
  }
}
