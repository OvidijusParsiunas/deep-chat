import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {OpenAIUtils} from '../../openAI/utils/openAIUtils';
import {URLDetails} from '../../../types/ollama';

export class OllamaOpenAIUtils {
  public static readonly URL_DETAILS_ERROR_MESSAGE =
    'Please configure Ollama preferrably with OLLAMA_HOST and OLLAMA_ORIGINS set. [More Information](https://github.com/ollama/ollama/blob/main/docs/faq.md)';

  public static buildHeaders(_apiKey: string) {
    return {
      'Content-Type': 'application/json',
    };
  }

  public static buildKeyVerificationDetails(urlDetails: URLDetails): KeyVerificationDetails {
    return {
      url: `${urlDetails?.endpoint}/models`,
      method: 'GET',
      handleVerificationResult: OpenAIUtils.handleVerificationResult,
    };
  }

  public static validateURLDetails(urlDetails: URLDetails) {
    return urlDetails?.endpoint;
  }
}
