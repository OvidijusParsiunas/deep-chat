import {ServiceCallConfig} from './requestSettings';
import {GenericObject} from './object';

// https://docs.cohere.com/reference/generate
export interface CohereGenerateConfig {
  model?: 'base-light' | 'base';
  max_tokens?: number;
  temperature?: number;
  k?: number;
  p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  end_sequences?: string[];
  stop_sequences?: string[];
  logit_bias?: GenericObject<string | number>;
  truncate?: 'NONE' | 'START' | 'END';
}

export interface Cohere {
  completions?: true | (CohereGenerateConfig & ServiceCallConfig);
}
