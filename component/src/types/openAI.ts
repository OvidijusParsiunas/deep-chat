// https://platform.openai.com/docs/guides/chat/introduction
export interface OpenAIMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// https://platform.openai.com/docs/api-reference/chat/create
export interface OpenAIChat {
  model: string;
  // These messages will not be displayed in the chat and are mostly useful for adding messages for the "system" role
  // Messages inside chat and in the startMessages will automatically be added to this property
  // See example details: https://platform.openai.com/docs/guides/chat/introduction
  messages?: OpenAIMessage[];
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
