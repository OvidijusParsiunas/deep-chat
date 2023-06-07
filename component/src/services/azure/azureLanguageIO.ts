import {IExistingServiceIO} from '../utils/existingServiceIO';
import {GenericObject} from '../../types/object';
import {AzureEndpoint} from '../../types/azure';
import {AzureUtils} from './utils/azureUtils';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

export class AzureLanguageIO extends IExistingServiceIO {
  override insertKeyPlaceholderText = 'Azure Language Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, config: APIKey & AzureEndpoint,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AzureUtils.buildLanguageKeyVerificationDetails(config.endpoint), buildHeadersFunc, config, existingFileTypes);
  }
}
