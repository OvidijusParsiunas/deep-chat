// https://platform.openai.com/docs/guides/chat/introduction
export interface OpenAIMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// https://platform.openai.com/docs/api-reference/chat/create
export interface OpenAIChat {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

// https://platform.openai.com/docs/api-reference/completions
export interface OpenAICompletions {
  model: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAI {
  chat?: OpenAIChat | true;
  completions?: OpenAICompletions | true;
}
