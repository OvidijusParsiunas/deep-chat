import {AzureKeyRetrievalResult, AzureSummarizationResult} from '../../../types/azureResult';
import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {GenericObject} from '../../../types/object';

export class AzureUtils {
  private static readonly SUBSCRIPTION_KEY_NAME = 'Ocp-Apim-Subscription-Key';

  public static buildTextToSpeechHeaders(outputFormat: string, key: string) {
    return {
      [AzureUtils.SUBSCRIPTION_KEY_NAME]: key,
      [CONTENT_TYPE_H_KEY]: 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,
    };
  }

  public static buildSpeechToTextHeaders(key: string) {
    return {
      [AzureUtils.SUBSCRIPTION_KEY_NAME]: key,
      Accept: APPLICATION_JSON,
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
      method: POST,
      createHeaders: (key: string) => {
        return {[AzureUtils.SUBSCRIPTION_KEY_NAME]: `${key}`};
      },
      handleVerificationResult: AzureUtils.handleSpeechVerificationResult,
    };
  }

  public static buildSummarizationHeader(key: string) {
    return {
      [AzureUtils.SUBSCRIPTION_KEY_NAME]: key,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
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
      method: POST,
      createHeaders: (key: string) => {
        return {[AzureUtils.SUBSCRIPTION_KEY_NAME]: `${key}`};
      },
      handleVerificationResult: AzureUtils.handleLanguageVerificationResult,
    };
  }

  // prettier-ignore
  private static handleTranslationVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const azureResult = result as Response;
    azureResult.json().then((result) => {
      // if the token is valid - it will throw a different error than a 401000
      if (!Array.isArray(result) && result.error.code === 401000) {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onSuccess(key);
      }
    });
  }

  public static buildTranslationKeyVerificationDetails(region?: string): KeyVerificationDetails {
    return {
      url: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es`,
      method: POST,
      createHeaders: (key: string) => {
        return AzureUtils.buildTranslationHeaders(region, key);
      },
      handleVerificationResult: AzureUtils.handleTranslationVerificationResult,
    };
  }

  public static buildTranslationHeaders(region: string | undefined, key: string) {
    const headers: GenericObject<string> = {
      [AzureUtils.SUBSCRIPTION_KEY_NAME]: key,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    };
    if (region) headers['Ocp-Apim-Subscription-Region'] = region;
    return headers;
  }
}
