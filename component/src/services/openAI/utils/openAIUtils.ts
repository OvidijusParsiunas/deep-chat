import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {INVALID_KEY, CONNECTION_FAILED} from '../../../utils/errorMessages/errorMessages';
import {BUILD_KEY_VERIFICATION_DETAILS} from '../../utils/directServiceUtils';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {DOCS_BASE_URL, ERROR} from '../../../utils/consts/messageConstants';
import {OpenAIConverseResult} from '../../../types/openAIResult';
import {RequestUtils} from '../../../utils/HTTP/requestUtils';
import {RequestDetails} from '../../../types/interceptors';
import {OPEN_AI_BASE_URL} from '../openAIConsts';
import {ServiceIO} from '../../serviceIO';

export const OPEN_AI_FUNCTION_TOOL_RESP_ERROR =
  'Response object must either be {response: string}[] for each individual function ' +
  `or {text: string} for a direct response, see ${DOCS_BASE_URL}directConnection/OpenAI#FunctionHandler.`;
export const OPEN_AI_FUNCTION_TOOL_RESP_ARR_ERROR = 'Arrays are not accepted in handler responses';

export const OPEN_AI_BUILD_HEADERS = (key: string) => {
  return {
    [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
    [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
  };
};

// prettier-ignore
export const OPEN_AI_HANDLE_VERIFICATION_RESULT = (result: object, key: string,
    onSuccess: (key: string) => void, onFail: (message: string) => void) => {
  const openAIResult = result as OpenAIConverseResult;
  if (openAIResult[ERROR]) {
    if (openAIResult[ERROR].code === 'invalid_api_key') {
      onFail(INVALID_KEY);
    } else {
      onFail(CONNECTION_FAILED);
    }
  } else {
    onSuccess(key);
  }
};

export const OPEN_AI_BUILD_KEY_VERIFICATION_DETAILS = (): KeyVerificationDetails => {
  return BUILD_KEY_VERIFICATION_DETAILS(`${OPEN_AI_BASE_URL}models`, GET, OPEN_AI_HANDLE_VERIFICATION_RESULT);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OPEN_AI_DIRECT_FETCH = async (serviceIO: ServiceIO, body: any, method: 'POST' | 'GET', stringify = true) => {
  const {connectSettings, deepChat, completionsHandlers, messages} = serviceIO;
  connectSettings.method = method;
  const requestDetails: RequestDetails = {body, headers: connectSettings.headers};
  const {body: interceptedBody, headers, error} = await RequestUtils.processRequestInterceptor(deepChat, requestDetails);
  const {onFinish} = completionsHandlers;
  if (error && messages) return RequestUtils.onInterceptorError(messages, error, onFinish);
  const result = await RequestUtils.fetch(serviceIO, headers, stringify, interceptedBody).then((resp) =>
    RequestUtils.processResponseByType(resp)
  );
  if (result[ERROR]) throw result[ERROR].message;
  return result;
};
