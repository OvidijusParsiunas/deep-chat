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
  // prettier-ignore
  constructor(aiAssistant: AiAssistant, buildHeadersFunc: BuildHeadersFunc, config: AzureServiceConfig,
     key?: string, fileType?: FILE_TYPES) {
    super(
      aiAssistant, AzureUtils.buildSpeechKeyVerificationDetails(config.region), buildHeadersFunc, config, key, fileType);
  }
}
