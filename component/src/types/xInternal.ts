export type XMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type XRequestBody = {
  model: string;
  input: XMessage[];
  instructions?: string;
  max_output_tokens?: number;
  temperature?: number;
  stream?: boolean;
};
