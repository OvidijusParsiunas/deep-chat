import {OpenAIConfig} from './openAI';

export interface OpenAIMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export interface OpenAIChatBody {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export type OpenAICompletionsBody = OpenAIConfig;
