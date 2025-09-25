import {KeyVerificationDetails} from '../../../types/keyVerificationDetails';
import {GET} from '../../utils/serviceConstants';

export class OllamaUtils {
  public static buildHeaders() {
    return {};
  }

  public static buildKeyVerificationDetails(): KeyVerificationDetails {
    return {
      url: '',
      method: GET,
      handleVerificationResult: () => {},
    };
  }
}
