export type GroqTextToSpeechRequestBody = {
  model: string;
  input: string;
  voice?: string;
  speed?: number;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
};
