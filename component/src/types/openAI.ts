import {APIKey} from './APIKey';

export interface OpenAIMessage {
  role: 'user' | 'system' | 'ai';
  content: string;
}

export type OpenAIAudioType = {
  type?: 'transcription' | 'translation';
};

// https://platform.openai.com/docs/api-reference/audio/create
export type OpenAIAudio = {
  model?: 'whisper-1';
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
};

export interface OpenAIImages {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

// totalMessagesMaxCharLength must include systemPrompt length
export type OpenAIChat = {systemPrompt?: string};

// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConverse {
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
}

export interface OpenAI {
  chat?: true | (APIKey & OpenAIConverse & OpenAIChat);
  completions?: true | (APIKey & OpenAIConverse);
  images?: true | (APIKey & OpenAIImages);
  audio?: true | (APIKey & OpenAIAudio & OpenAIAudioType);
}
