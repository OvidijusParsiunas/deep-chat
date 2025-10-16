import {APPLICATION_JSON, AUTHORIZATION_H, BEARER_PREFIX, CONTENT_TYPE_H_KEY, GET} from '../../utils/serviceConstants';
import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {INVALID_KEY} from '../../../utils/errorMessages/errorMessages';
import {CohereChatResult} from '../../../types/cohereResult';

export class CohereUtils {
  public static buildHeaders(key: string) {
    return {
      [AUTHORIZATION_H]: `${BEARER_PREFIX}${key}`,
      [CONTENT_TYPE_H_KEY]: APPLICATION_JSON,
      accept: APPLICATION_JSON,
    };
  }

  // prettier-ignore
  private static handleVerificationResult(result: object, key: string,
      onSuccess: (key: string) => void, onFail: (message: string) => void) {
    const cohereResult = result as CohereChatResult;
    // if the token is valid - it will simply error out that the prompt is wrong
    // using this approach to not cost anything to the user
    if (typeof cohereResult.message === 'string') {
      onFail(INVALID_KEY);
    } else {
      onSuccess(key);
    }
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: 'https://api.cohere.ai/v1/models',
      method: GET,
      handleVerificationResult: CohereUtils.handleVerificationResult,
    };
  }
}
