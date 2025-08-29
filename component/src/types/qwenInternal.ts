export type QwenMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type QwenRequestBody = {
  model: string;
  messages: QwenMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
};