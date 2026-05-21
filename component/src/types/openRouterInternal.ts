import {OpenRouterReasoning, OpenRouterResponseFormat, OpenRouterTool, OpenRouterToolChoice} from './openRouter';

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
  models?: string[];
  messages: OpenRouterMessage[];
  tools?: OpenRouterTool[];
  tool_choice?: OpenRouterToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: OpenRouterResponseFormat;
  reasoning?: OpenRouterReasoning;
  stream?: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
};
