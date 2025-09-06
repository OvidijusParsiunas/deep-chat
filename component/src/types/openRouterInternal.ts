import {OpenRouterTool} from './openRouter';

export type OpenRouterToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type OpenRouterContent = {
  type: 'text' | 'image_url' | 'input_audio';
  text?: string;
  image_url?: {
    url: string;
  };
  input_audio?: {
    data: string;
    format: 'wav' | 'mp3';
  };
};

export type OpenRouterMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | OpenRouterContent[] | null;
  tool_calls?: OpenRouterToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type OpenRouterRequestBody = {
  model: string;
  messages: OpenRouterMessage[];
  tools?: OpenRouterTool[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
};