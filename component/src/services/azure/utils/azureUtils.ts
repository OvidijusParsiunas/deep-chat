import {AzureKeyRetrievalResult, AzureSummarizationResult} from '../../../types/azureResult';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';

export class AzureUtils {
  public static buildTextToSpeechHeaders(outputFormat: string, key: string) {
    return {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,
    };
  }

  public static buildSpeechToTextHeaders(key: string) {
    return {
      'Ocp-Apim-Subscription-Key': key,
      Accept: 'application/json',
    };
  }

  // prettier-ignore
  private static handleSpeechVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const azureResult = result as AzureKeyRetrievalResult;
    if (azureResult.error) {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildSpeechKeyVerificationDetails(region: string): KeyVerificationDetails {
    return {
      url: `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
      method: 'POST',
      createHeaders: (key: string) => {
        return {'Ocp-Apim-Subscription-Key': `${key}`};
      },
      handleVerificationResult: AzureUtils.handleSpeechVerificationResult,
    };
  }

  public static buildSummarizationHeader(key: string) {
    return {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleLanguageVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const azureResult = result as AzureSummarizationResult;
    // if the token is valid - it will throw a different error than a 401
    if (azureResult.error?.code === "401") {
      onFail(ErrorMessages.INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildLanguageKeyVerificationDetails(endpoint: string): KeyVerificationDetails {
    return {
      url: `${endpoint}/language/analyze-text/jobs?api-version=2022-10-01-preview`,
      method: 'POST',
      createHeaders: (key: string) => {
        return {'Ocp-Apim-Subscription-Key': `${key}`};
      },
      handleVerificationResult: AzureUtils.handleLanguageVerificationResult,
    };
  }
}
