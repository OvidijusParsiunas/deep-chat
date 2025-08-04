import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';

export class OllamaUtils {
  public static buildHeaders() {
    return {};
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: '',
      method: 'GET',
      handleVerificationResult: () => {},
    };
  }
}
