import {GenericObject} from './object';

// https://docs.cohere.com/reference/summarize-2
export interface CohereSummarizationConfig {
  model?: string;
  length?: 'auto' | 'short' | 'medium' | 'long';
  format?: 'auto' | 'paragraph' | 'bullets';
  extractiveness?: 'auto' | 'low' | 'medium' | 'high';
  temperature?: number;
  additional_command?: string;
}

// https://docs.cohere.com/reference/generate
export interface CohereGenerateConfig {
  model?: string;
  max_tokens?: number; // we default it to 1000
  truncate?: 'NONE' | 'START' | 'END';
  temperature?: number;
  k?: number;
  p?: number;
  end_sequences?: string[];
  stop_sequences?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  logit_bias?: GenericObject<string | number>;
  preset?: string;
}

// stream API only supported for server to server communication (application/stream+json)
// https://docs.cohere.com/reference/chat
export interface CohereChatConfig {
  model?: string;
  temperature?: number;
  prompt_truncation?: 'AUTO' | 'OFF';
  connectors?: {id: string}[];
  documents?: {title: string; snippet: string}[];
}

export interface Cohere {
  chat?: true | CohereChatConfig;
  textGeneration?: true | CohereGenerateConfig;
  summarization?: true | CohereSummarizationConfig;
}
