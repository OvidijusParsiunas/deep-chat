import {RequestyToolCall} from './requestyInternal';

export type RequestyImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type RequestyResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      tool_calls?: RequestyToolCall[];
      images?: RequestyImageContent[];
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

export type RequestyStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      images?: RequestyImageContent[];
      tool_calls?: RequestyToolCall[];
    };
    finish_reason?: string;
  }>;
  message?: {
    role: 'assistant';
    content: string | null;
    tool_calls?: RequestyToolCall[];
    images?: RequestyImageContent[];
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export type RequestyAPIResult = RequestyResponse | RequestyStreamEvent;
