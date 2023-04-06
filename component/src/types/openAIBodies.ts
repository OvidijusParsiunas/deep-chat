import {OpenAICompletions} from './openAI';

// https://platform.openai.com/docs/guides/chat/introduction
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

// https://platform.openai.com/docs/api-reference/completions
export type OpenAICompletionsBody = OpenAICompletions;
