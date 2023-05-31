import {ExistingServiceAudioRecordingConfig} from './microphone';
import {ExistingServiceCameraConfig} from './camera';
import {ServiceCallConfig} from './requestSettings';
import {MessageLimits} from './chatLimits';
import {Key} from './key';

export interface OpenAIMessage {
  role: 'user' | 'system' | 'ai';
  content: string;
}

export type OpenAIAudioType = {
  type?: 'transcriptions' | 'translations';
};

// https://platform.openai.com/docs/api-reference/audio/create
export interface OpenAIAudioConfig {
  model?: 'whisper-1';
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
}

export interface OpenAIImagesConfig {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

// total_messages_max_char_length must include systemPrompt length
export type OpenAICustomChatConfig = {systemPrompt?: string} & MessageLimits;

// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConverseConfig {
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAI {
  chat?: true | (Key & OpenAIConverseConfig & OpenAICustomChatConfig & ServiceCallConfig);
  completions?: true | (Key & OpenAIConverseConfig & ServiceCallConfig);
  images?: true | (Key & OpenAIImagesConfig & ExistingServiceCameraConfig);
  audio?: true | (Key & OpenAIAudioConfig & OpenAIAudioType & ExistingServiceAudioRecordingConfig);
}
