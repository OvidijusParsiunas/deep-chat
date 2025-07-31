export type GrokMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type GrokRequestBody = {
  model: string;
  messages: GrokMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};
