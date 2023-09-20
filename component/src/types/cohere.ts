import {GenericObject} from './object';

// https://docs.cohere.com/reference/summarize-2
export interface CohereSummarizationConfig {
  model?: 'string';
  length?: 'auto' | 'short' | 'medium' | 'long';
  format?: 'auto' | 'paragraph' | 'bullets';
  extractiveness?: 'auto' | 'low' | 'medium' | 'high';
  temperature?: number;
  additional_command?: string;
}

// https://docs.cohere.com/reference/generate
export interface CohereGenerateConfig {
  model?: 'string';
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

// https://docs.cohere.com/docs/conversational-ai
export interface CohereChatConfig {
  model?: string;
  user_name?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface Cohere {
  chat?: true | CohereChatConfig;
  textGeneration?: true | CohereGenerateConfig;
  summarization?: true | CohereSummarizationConfig;
}
