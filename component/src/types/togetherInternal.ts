export type TogetherMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type TogetherRequestBody = {
  model: string;
  messages: TogetherMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repetition_penalty?: number;
  stop?: string[];
  stream?: boolean;
};

export type TogetherImagesRequestBody = {
  model: string;
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  n?: number;
  seed?: number;
  response_format?: 'url' | 'base64';
};

export type TogetherTextToSpeechRequestBody = {
  model: string;
  input: string;
  voice?: string;
  speed?: number;
};
