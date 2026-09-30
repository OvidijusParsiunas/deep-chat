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
