import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {DOCS_BASE_URL} from '../../../utils/consts/messageConstants';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {ServiceIO} from '../../serviceIO';

export class OpenAIUtils {
  public static readonly FUNCTION_TOOL_RESP_ERROR =
    'Response object must either be {response: string}[] for each individual function ' +
    `or {text: string} for a direct response, see ${DOCS_BASE_URL}directConnection/OpenAI#FunctionHandler.`;
  public static readonly FUNCTION_TOOL_RESP_ARR_ERROR = 'Arrays are not accepted in handler responses';

  public static buildHeaders(key: string) {
    return {
      [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
    };
  }

  // prettier-ignore
  public static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const openAIResult = result as OpenAIConverseResult;
    if (openAIResult.error) {
      if (openAIResult.error.code === 'invalid_api_key') {
        onFail(INVALID_KEY);
      } else {
        onFail(CONNECTION_FAILED);
      }
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.openai.com/v1/models',
      method: GET,
      handleVerificationResult: OpenAIUtils.handleVerificationResult,
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
