import {AZURE_BUILD_LANGUAGE_KEY_VERIFICATION_DETAILS, AZURE_SUBSCRIPTION_KEY_HELP_URL} from './utils/azureUtils';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class AzureLanguageIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Azure Language Subscription Key';
  override keyHelpUrl = AZURE_SUBSCRIPTION_KEY_HELP_URL;
  permittedErrorPrefixes = ['Access'];

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, endpoint: string, apiKey?: APIKey,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AZURE_BUILD_LANGUAGE_KEY_VERIFICATION_DETAILS(endpoint), buildHeadersFunc, apiKey, existingFileTypes);
  }
}
