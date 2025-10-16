import {DOCS_BASE_URL} from '../../utils/consts/messageConstants';
import {DirectServiceIO} from '../utils/directServiceIO';
import {BuildHeadersFunc} from '../../types/headers';
import {ServiceFileTypes} from '../serviceIO';
import {AzureUtils} from './utils/azureUtils';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

export class AzureSpeechIO extends DirectServiceIO {
  // prettier-ignore
  protected static readonly REGION_ERROR_PREFIX =
    `Please define a region config property. [More Information](${DOCS_BASE_URL}directConnection/Azure#`;
  override insertKeyPlaceholderText = 'Azure Speech Subscription Key';
  override keyHelpUrl = AzureUtils.SUBSCRIPTION_KEY_HELP_URL;

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, region: string, apiKey?: APIKey,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AzureUtils.buildSpeechKeyVerificationDetails(region), buildHeadersFunc, apiKey, existingFileTypes);
  }
}
