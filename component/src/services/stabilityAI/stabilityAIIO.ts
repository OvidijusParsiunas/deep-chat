import {KeyVerificationDetails} from '../../types/keyVerificationDetails';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class StabilityAIIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Stability AI API Key';
  override keyHelpUrl = 'https://platform.stability.ai/docs/getting-started/authentication';
  permittedErrorPrefixes = ['Incorrect', 'invalid_'];

  // prettier-ignore
  constructor(deepChat: DeepChat, keyVerificationDetails: KeyVerificationDetails,
      buildHeadersFunc: BuildHeadersFunc, apiKey?: APIKey, existingFileTypes?: ServiceFileTypes) {
    super(deepChat, keyVerificationDetails, buildHeadersFunc, apiKey, existingFileTypes);
  }
}
