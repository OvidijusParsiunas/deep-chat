import {OpenAIMessage} from './openAI';

export interface OpenAIInternalParams {
  model: string;
  messages?: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAIInternal {
  chat: OpenAIInternalParams;
  completions: OpenAIInternalParams;
}
