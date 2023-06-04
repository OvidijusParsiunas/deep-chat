import {BaseServideIO} from '../utils/baseServiceIO';
import {GenericObject} from '../../types/object';
import {AzureEndpoint} from '../../types/azure';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {ServiceFileTypes} from '../serviceIO';
import {APIKey} from '../../types/APIKey';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

export class AzureLanguageIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'Azure Language Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, buildHeadersFunc: BuildHeadersFunc, config: APIKey & AzureEndpoint,
      defaultFileTypes?: ServiceFileTypes) {
    super(aiAssistant,
      AzureUtils.buildLanguageKeyVerificationDetails(config.endpoint), buildHeadersFunc, config, defaultFileTypes);
  }
}
