import {HuggingFaceTextGenerationResult} from '../../../types/huggingFaceResult';
import {ErrorMessages} from '../../../utils/errorMessages/errorMessages';
import {RequestSettings} from '../../../types/requestSettings';
import {HTTPRequest} from '../../../utils/HTTP/HTTPRequest';
import {GenericObject} from '../../../types/object';

export class HuggingFaceUtils {
  private static readonly _generate_url = 'https://api-inference.huggingface.co/models/gpt2';

  public static buildRequestSettings(key: string, requestSettings?: RequestSettings) {
    const requestSettingsObj = requestSettings ?? {};
    requestSettingsObj.headers ??= HuggingFaceUtils.buildHeaders(key) as unknown as GenericObject<string>;
    return requestSettingsObj;
  }

  private static buildHeaders(key: string) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json', // bigcode/santacoder expects this so adding just-in-case
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const huggingFaceResult = result as HuggingFaceTextGenerationResult;
    // if the token is valid - it will simply error out that the pameters are required
    if (Array.isArray(huggingFaceResult.error) && huggingFaceResult.error[0] === 'Error in `parameters`: field required') {
      onSuccess(key);
    } else {
      onFail(ErrorMessages.INVALID_KEY);
    }
  }

  // prettier-ignore
  public static verifyKey(inputElement: HTMLInputElement,
      onSuccess: (key: string) => void, onFail: (message: string) => void, onLoad: () => void) {
    const key = inputElement.value.trim();
    const headers = HuggingFaceUtils.buildHeaders(key);
    HTTPRequest.verifyKey(key, HuggingFaceUtils._generate_url, headers, 'POST',
      onSuccess, onFail, onLoad, HuggingFaceUtils.handleVerificationResult);
  }
}
