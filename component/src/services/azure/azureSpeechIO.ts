import {AZURE_SUBSCRIPTION_KEY_HELP_URL, AZURE_BUILD_SPEECH_KEY_VERIFICATION_DETAILS} from './utils/azureUtils';
import {DOCS_BASE_URL} from '../../utils/consts/messageConstants';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class AzureSpeechIO extends DirectServiceIO {
  // prettier-ignore
  protected static readonly REGION_ERROR_PREFIX =
    `Please define a region config property. [More Information](${DOCS_BASE_URL}directConnection/Azure#`;
  override insertKeyPlaceholderText = 'Azure Speech Subscription Key';
  override keyHelpUrl = AZURE_SUBSCRIPTION_KEY_HELP_URL;

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, region: string, apiKey?: APIKey,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AZURE_BUILD_SPEECH_KEY_VERIFICATION_DETAILS(region), buildHeadersFunc, apiKey, existingFileTypes);
  }
}
