import {ServiceCallConfig} from '../../types/requestSettings';
import {BaseServideIO} from '../utils/baseServiceIO';
import {GenericObject} from '../../types/object';
import {FILE_TYPES} from '../../types/fileTypes';
import {AzureEndpoint} from '../../types/azure';
import {AiAssistant} from '../../aiAssistant';
import {AzureUtils} from './utils/azureUtils';

type BuildHeadersFunc = (key: string) => GenericObject<string>;

type AzureServiceConfig = AzureEndpoint & ServiceCallConfig;

export class AzureLanguageIO extends BaseServideIO {
  // prettier-ignore
  constructor(aiAssistant: AiAssistant, buildHeadersFunc: BuildHeadersFunc, config: AzureServiceConfig,
     key?: string, fileType?: FILE_TYPES) {
    super(
      aiAssistant, AzureUtils.buildLanguageKeyVerificationDetails(config.endpoint),
      buildHeadersFunc, config, key, fileType);
  }
}
