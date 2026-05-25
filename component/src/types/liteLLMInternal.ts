export type LiteLLMMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type LiteLLMRequestBody = {
  model: string;
  messages: LiteLLMMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};
