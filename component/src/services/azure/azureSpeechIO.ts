import {ExistingServiceIO} from '../utils/existingServiceIO';
import {GenericObject} from '../../types/object';
import {ServiceFileTypes} from '../serviceIO';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {AzureRegion} from '../../types/azure';
import {APIKey} from '../../types/APIKey';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

export class AzureSpeechIO extends ExistingServiceIO {
  override insertKeyPlaceholderText = 'Azure Speech Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, buildHeadersFunc: BuildHeadersFunc, config: APIKey & AzureRegion,
      defaultFileTypes?: ServiceFileTypes) {
    super(aiAssistant,
      AzureUtils.buildSpeechKeyVerificationDetails(config.region), buildHeadersFunc, config, defaultFileTypes);
  }
}
