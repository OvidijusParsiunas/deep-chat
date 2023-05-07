import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {RequestSettings} from '../../../types/requestSettings';
import {HTTPRequest} from '../../../utils/HTTP/HTTPRequest';
import {CohereResult} from '../../../types/cohereResult';
import {GenericObject} from '../../../types/object';

export class CohereUtils {
  private static readonly _generate_url = 'https://api.cohere.ai/v1/generate';

  public static buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers ??= CohereUtils.buildHeaders(key) as unknown as GenericObject<string>;
    return requestSettingsObj;
  }

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const cohereResult = result as CohereResult;
    // if the token is valid - it will simply error out that the prompt is wrong
    if (cohereResult.message === 'invalid request: prompt must be at least 1 token long') {
      onSuccess(key);
    } else {
      onFail(ErrorMessages.INVALID_KEY);
    }
  }

  // prettier-ignore
  public static verifyKey(inputElement: HTMLInputElement,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void) {
    const key = inputElement.value.trim();
    const headers = CohereUtils.buildHeaders(key);
    HTTPRequest.verifyKey(key, CohereUtils._generate_url, headers, 'POST',
      onSuccess, onFail, onLoad, CohereUtils.handleVerificationResult, JSON.stringify({prompt: ''}));
  }
}
