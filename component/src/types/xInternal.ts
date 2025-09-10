export type XMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type XRequestBody = {
  model: string;
  messages: XMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
};
