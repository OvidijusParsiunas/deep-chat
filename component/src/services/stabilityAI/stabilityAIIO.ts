import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {INCORRECT_ERROR_PREFIX} from '../utils/serviceConstants';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class StabilityAIIO extends DirectServiceIO {
  override insertKeyPlaceholderText = this.genereteAPIKeyName('Stability AI');
  override keyHelpUrl = 'https://platform.stability.ai/docs/getting-started/authentication';
  permittedErrorPrefixes = [INCORRECT_ERROR_PREFIX, 'invalid_'];

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey, existingFileTypes);
  }
}
