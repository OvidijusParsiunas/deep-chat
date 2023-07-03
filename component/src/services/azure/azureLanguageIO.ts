import {DirectServiceIO} from '../utils/directServiceIO';
import {GenericObject} from '../../types/object';
import {AzureUtils} from './utils/azureUtils';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

export class AzureLanguageIO extends DirectServiceIO {
  override insertKeyPlaceholderText = 'Azure Language Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, endpoint: string, apiKey?: APIKey,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AzureUtils.buildLanguageKeyVerificationDetails(endpoint), buildHeadersFunc, apiKey, existingFileTypes);
  }
}
