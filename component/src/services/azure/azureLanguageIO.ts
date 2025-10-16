import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {AzureUtils} from './utils/azureUtils';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class AzureLanguageIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Azure Language Subscription Key';
  override keyHelpUrl = AzureUtils.SUBSCRIPTION_KEY_HELP_URL;
  permittedErrorPrefixes = ['Access'];

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, endpoint: string, apiKey?: APIKey,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AzureUtils.buildLanguageKeyVerificationDetails(endpoint), buildHeadersFunc, apiKey, existingFileTypes);
  }
}
