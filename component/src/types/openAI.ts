import {ServiceCallConfig} from './requestSettings';
import {MessageLimits} from './chatLimits';
import {AudioFiles} from './microphone';
import {ImageFiles} from './camera';

export interface OpenAIMessage {
  role: 'user' | 'system' | 'ai';
  content: string;
}

export type OpenAIAudioType = {
  type?: 'transcriptions' | 'translations';
};

// https://platform.openai.com/docs/api-reference/audio/create
export type OpenAIAudio = {
  model?: 'whisper-1';
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
} & OpenAIAudioType;

export interface OpenAIImages {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

// totalMessagesMaxCharLength must include systemPrompt length
export type OpenAIChat = {systemPrompt?: string} & MessageLimits;

// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConverse {
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAI {
  chat?: true | (ServiceCallConfig & OpenAIConverse & OpenAIChat);
  completions?: true | (ServiceCallConfig & OpenAIConverse);
  images?: true | (ServiceCallConfig & OpenAIImages & ImageFiles);
  audio?: true | (ServiceCallConfig & OpenAIAudio & AudioFiles);
}
