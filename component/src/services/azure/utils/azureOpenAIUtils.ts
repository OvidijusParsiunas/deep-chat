import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {DOCS_BASE_URL} from '../../../utils/consts/messageConstants';
import {OpenAIUtils} from '../../openAI/utils/openAIUtils';
import {AzureOpenAI} from '../../../types/azure';

export class AzureOpenAIUtils {
  // prettier-ignore
  public static readonly URL_DETAILS_ERROR_MESSAGE
    = `Please define the Azure URL Details. [More Information](${DOCS_BASE_URL}directConnection/Azure)`;

  public static buildHeaders(apiKey: string) {
    return {
      'api-key': apiKey,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    };
  }

  public static buildKeyVerificationDetails(urlDetails: AzureOpenAI['urlDetails']): KeyVerificationDetails {
    return {
      url: `${urlDetails.endpoint}/openai/models?api-version=${urlDetails.version}`,
      method: GET,
      handleVerificationResult: OpenAIUtils.handleVerificationResult,
    };
  }

  public static validateURLDetails(urlDetails: AzureOpenAI['urlDetails']) {
    const {endpoint, version, deploymentId} = urlDetails;
    return endpoint && version && deploymentId;
  }
}
