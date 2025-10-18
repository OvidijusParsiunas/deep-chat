import {AzureKeyRetrievalResult, AzureSummarizationResult} from '../../../types/azureResult';
import {APPLICATION_JSON, CONTENT_TYPE_H_KEY, POST} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {ERROR} from '../../../utils/consts/messageConstants';
import {GenericObject} from '../../../types/object';

const AZURE_SUBSCRIPTION_KEY_NAME = 'Ocp-Apim-Subscription-Key';

export const AZURE_SUBSCRIPTION_KEY_HELP_URL =
  // eslint-disable-next-line max-len
  'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

export const AZURE_BUILD_TEXT_TO_SPEECH_HEADERS = (outputFormat: string, key: string) => {
  return {
    [AZURE_SUBSCRIPTION_KEY_NAME]: key,
    [CONTENT_TYPE_H_KEY]: 'application/ssml+xml',
    'X-Microsoft-OutputFormat': outputFormat,
  };
};

export const AZURE_BUILD_SPEECH_TO_TEXT_HEADERS = (key: string) => {
  return {
    [AZURE_SUBSCRIPTION_KEY_NAME]: key,
    Accept: APPLICATION_JSON,
  };
};

const AZURE_HANDLE_SPEECH_VERIFICATION_RESULT = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const azureResult = result as AzureKeyRetrievalResult;
  if (azureResult[ERROR]) {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const AZURE_BUILD_SPEECH_KEY_VERIFICATION_DETAILS = (region: string): KeyVerificationDetails => {
  return {
    url: `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`,
    method: POST,
    createHeaders: (key: string) => {
      return {[AZURE_SUBSCRIPTION_KEY_NAME]: `${key}`};
    },
    handleVerificationResult: AZURE_HANDLE_SPEECH_VERIFICATION_RESULT,
  };
};

export const AZURE_BUILD_SUMMARIZATION_HEADER = (key: string) => {
  return {
    [AZURE_SUBSCRIPTION_KEY_NAME]: key,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

const AZURE_HANDLE_LANGUAGE_VERIFICATION_RESULT = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const azureResult = result as AzureSummarizationResult;
  // if the token is valid - it will throw a different error than a 401
  if (azureResult[ERROR]?.code === '401') {
    onFail(INVALID_KEY);
  } else {
    onSuccess(key);
  }
};

export const AZURE_BUILD_LANGUAGE_KEY_VERIFICATION_DETAILS = (endpoint: string): KeyVerificationDetails => {
  return {
    url: `${endpoint}/language/analyze-text/jobs?api-version=2022-10-01-preview`,
    method: POST,
    createHeaders: (key: string) => {
      return {[AZURE_SUBSCRIPTION_KEY_NAME]: `${key}`};
    },
    handleVerificationResult: AZURE_HANDLE_LANGUAGE_VERIFICATION_RESULT,
  };
};

const AZURE_HANDLE_TRANSLATION_VERIFICATION_RESULT = (
  result: object,
  key: string,
  onSuccess: (key: string) => void,
  onFail: (message: string) => void
) => {
  const azureResult = result as Response;
  azureResult.json().then((result) => {
    // if the token is valid - it will throw a different error than a 401000
    if (!Array.isArray(result) && result[ERROR].code === 401000) {
      onFail(INVALID_KEY);
    } else {
      onSuccess(key);
    }
  });
};

export const AZURE_BUILD_TRANSLATION_KEY_VERIFICATION_DETAILS = (region?: string): KeyVerificationDetails => {
  return {
    url: `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es`,
    method: POST,
    createHeaders: (key: string) => {
      return AZURE_BUILD_TRANSLATION_HEADERS(region, key);
    },
    handleVerificationResult: AZURE_HANDLE_TRANSLATION_VERIFICATION_RESULT,
  };
};

export const AZURE_BUILD_TRANSLATION_HEADERS = (region: string | undefined, key: string) => {
  const headers: GenericObject<string> = {
    [AZURE_SUBSCRIPTION_KEY_NAME]: key,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
  if (region) headers['Ocp-Apim-Subscription-Region'] = region;
  return headers;
};
