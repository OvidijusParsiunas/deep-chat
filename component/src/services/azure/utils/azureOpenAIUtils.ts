import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {OPEN_AI_HANDLE_VERIFICATION_RESULT} from '../../openAI/utils/openAIUtils';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {DOCS_BASE_URL} from '../../../utils/consts/messageConstants';
import {AzureOpenAI} from '../../../types/azure';

// prettier-ignore
export const AZURE_OPEN_AI_URL_DETAILS_ERROR
  = `Please define the Azure URL Details. [More Information](${DOCS_BASE_URL}directConnection/Azure)`;

export const AZURE_OPEN_AI_BUILD_HEADERS = (apiKey: string) => {
  return {
    'api-key': apiKey,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

export const AZURE_OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS = (
  urlDetails: AzureOpenAI['urlDetails']
): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(
    `${urlDetails.endpoint}/openai/models?api-version=${urlDetails.version}`,
    GET,
    OPEN_AI_HANDLE_VERIFICATION_RESULT
  );
};

export const AZURE_OPEN_AI_VALIDATE_URL_DETAILS = (urlDetails: AzureOpenAI['urlDetails']) => {
  const {endpoint, version, deploymentId} = urlDetails;
  return endpoint && version && deploymentId;
};
