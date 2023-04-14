export interface OpenAIMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConverseConfig {
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAIImagesConfig {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export interface OpenAICustomChatLimits {
  total_messages_max_char_length?: number; // uses OpenAIBaseBodyGenerator.MAX_CHAR_LENGTH by default
  max_messages?: number;
}

export interface OpenAICustomCompletionLimits {
  max_char_length?: number; // uses inputCharacterLimit or OpenAIBaseBodyGenerator.MAX_CHAR_LENGTH by default
}

export interface OpenAI {
  chat?: true | (OpenAIConverseConfig & OpenAICustomChatLimits);
  completions?: true | (OpenAIConverseConfig & OpenAICustomCompletionLimits);
  images?: true | OpenAIConverseConfig;
}
