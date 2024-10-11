import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';
import { AzureConfig } from '../../../types/azureOpenAI';

export class AzureOpenAIUtils {
  public static buildHeaders(key: string) {
    return {
      "api-key": key,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const openAIResult = result as OpenAIConverseResult;
    if (openAIResult.error) {
      if (openAIResult.error.code === 'invalid_api_key') {
        onFail(ErrorMessages.INVALID_KEY);
      } else {
        onFail(ErrorMessages.CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(azureConfig: AzureConfig): KeyVerificationDetails {
    return {
      url: `${azureConfig.endpoint}/openai/models?api-version=${azureConfig.version}`,
      method: 'GET',
      handleVerificationResult: AzureOpenAIUtils.handleVerificationResult,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async directFetch(serviceIO: ServiceIO, body: any, method: 'POST' | 'GET', stringify = true) {
    serviceIO.connectSettings.method = method;
    const result = await RequestUtils.fetch(serviceIO, serviceIO.connectSettings.headers, stringify, body).then((resp) =>
      RequestUtils.processResponseByType(resp)
    );
    if (result.error) throw result.error.message;
    return result;
  }
}
