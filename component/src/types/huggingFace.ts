import {ServiceCallConfig} from './requestSettings';

export interface HuggingFaceConfig {
  model?: string;
}

export interface HuggingFace {
  textGeneration?: true | (HuggingFaceConfig & ServiceCallConfig);
}
