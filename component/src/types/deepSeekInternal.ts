export type DeepSeekMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type DeepSeekRequestBody = {
  model: string;
  messages: DeepSeekMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};
