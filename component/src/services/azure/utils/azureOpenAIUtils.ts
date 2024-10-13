import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {OpenAIUtils} from '../../openAI/utils/openAIUtils';
import {AzureOpenAI} from '../../../types/azure';

export class AzureOpenAIUtils {
  public static buildHeaders(apiKey: string) {
    return {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    };
  }

  public static buildKeyVerificationDetails(urlDetails: AzureOpenAI['urlDetails']): KeyVerificationDetails {
    return {
      url: `${urlDetails.endpoint}/openai/models?api-version=${urlDetails.version}`,
      method: 'GET',
      handleVerificationResult: OpenAIUtils.handleVerificationResult,
    };
  }
}
