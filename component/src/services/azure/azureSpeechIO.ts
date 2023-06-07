import {IExistingServiceIO} from '../utils/existingServiceIO';
import {GenericObject} from '../../types/object';
import {ServiceFileTypes} from '../serviceIO';
import {AzureUtils} from './utils/azureUtils';
import {AzureRegion} from '../../types/azure';
import {APIKey} from '../../types/APIKey';
import {DeepChat} from '../../deepChat';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

export class AzureSpeechIO extends IExistingServiceIO {
  override insertKeyPlaceholderText = 'Azure Speech Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(deepChat: DeepChat, buildHeadersFunc: BuildHeadersFunc, config: APIKey & AzureRegion,
      existingFileTypes?: ServiceFileTypes) {
    super(deepChat,
      AzureUtils.buildSpeechKeyVerificationDetails(config.region), buildHeadersFunc, config, existingFileTypes);
  }
}
