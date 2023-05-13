import {ServiceCallConfig} from '../../types/requestSettings';
import {BaseServideIO} from '../utils/baseServiceIO';
import {GenericObject} from '../../types/object';
import {FILE_TYPES} from '../../types/fileTypes';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';
import {AzureRegion} from '../../types/azure';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type AzureServiceConfig = AzureRegion & ServiceCallConfig;

export class AzureSpeechIO extends BaseServideIO {
  override insertKeyPlaceholderText = 'Azure Speech Subscription Key';
  override getKeyLink =
    // eslint-disable-next-line max-len
    'https://learn.microsoft.com/en-us/azure/api-management/api-management-subscriptions#create-and-manage-subscriptions-in-azure-portal';

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, buildHeadersFunc: BuildHeadersFunc, config: AzureServiceConfig,
     key?: string, fileType?: FILE_TYPES) {
    super(
      aiAssistant, AzureUtils.buildSpeechKeyVerificationDetails(config.region), buildHeadersFunc, config, key, fileType);
  }
}
