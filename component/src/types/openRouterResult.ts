import {OpenRouterToolCall} from './openRouterInternal';

export type OpenRouterImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type OpenRouterResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: OpenRouterToolCall[];
      images?: OpenRouterImageContent[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export type OpenRouterStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      images?: OpenRouterImageContent[];
      tool_calls?: OpenRouterToolCall[];
    };
    finish_reason?: string;
  }>;
  message?: {
    role: 'assistant';
    content: string | null;
    tool_calls?: OpenRouterToolCall[];
    images?: OpenRouterImageContent[];
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export type OpenRouterAPIResult = OpenRouterResponse | OpenRouterStreamEvent;
