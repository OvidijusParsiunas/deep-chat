import {RequestyReasoning, RequestyResponseFormat, RequestyTool, RequestyToolChoice} from './requesty';

export type RequestyToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type RequestyContent = {
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

export type RequestyMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | RequestyContent[] | null;
  tool_calls?: RequestyToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type RequestyRequestBody = {
  model: string;
  models?: string[];
  messages: RequestyMessage[];
  tools?: RequestyTool[];
  tool_choice?: RequestyToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: RequestyResponseFormat;
  reasoning?: RequestyReasoning;
  stream?: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
};
