import {ServiceCallConfig} from './requestSettings';
import {GenericObject} from './object';
import {Key} from './key';

// https://docs.cohere.com/reference/summarize-2
export interface CohereSummarizationConfig {
  model?: 'summarize-medium' | 'summarize-xlarge';
  length?: 'auto' | 'short' | 'medium' | 'long';
  format?: 'auto' | 'paragraph' | 'bullets';
  extractiveness?: 'auto' | 'low' | 'medium' | 'high';
  temperature?: number;
  additional_command?: string;
}

// https://docs.cohere.com/reference/generate
export interface CohereGenerateConfig {
  model?: 'base-light' | 'base';
  max_tokens?: number; // we default it to 1000
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
  textGeneration?: true | (Key & ServiceCallConfig & CohereGenerateConfig);
  summarization?: true | (Key & ServiceCallConfig & CohereSummarizationConfig);
}
