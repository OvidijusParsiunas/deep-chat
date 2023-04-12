import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {RequestSettings} from '../../../types/requestSettings';
import {HTTPRequest} from '../../../utils/HTTP/HTTPRequest';
import {OpenAIResult} from '../../../types/openAIResult';
import {GenericObject} from '../../../types/object';

export class OpenAIUtils {
  // roughly adds up to 3,804 tokens just to be safe
  public static readonly MAX_CHAR_LENGTH: number = 13352;
  private static readonly _models_url = 'https://api.openai.com/v1/models';

  public static buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers ??= OpenAIUtils.buildHeaders(key) as unknown as GenericObject<string>;
    return requestSettingsObj;
  }

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const openAIResult = result as OpenAIResult;
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

  // prettier-ignore
  public static verifyKey(inputElement: HTMLInputElement,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void) {
    const key = inputElement.value.trim();
    const headers = OpenAIUtils.buildHeaders(key);
    HTTPRequest.verifyKey(key, OpenAIUtils._models_url, headers,
      onSuccess, onFail, onLoad, OpenAIUtils.handleVerificationResult);
  }
}
