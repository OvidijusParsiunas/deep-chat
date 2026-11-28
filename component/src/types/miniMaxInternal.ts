import {MiniMaxTextToSpeech} from './miniMax';

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxRequestBody {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}

export interface MiniMaxTextToSpeechRequestBody extends MiniMaxTextToSpeech {
  model: string;
  text: string;
  stream: false;
  output_format: 'url';
}
