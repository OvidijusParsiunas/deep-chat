import {ChatCompletionsResponseFormat, ChatCompletionsTool, ChatCompletionsToolChoice} from './chatCompletions';

export type ChatCompletionsToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type ChatCompletionsContent = {
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

export type ChatCompletionsMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | ChatCompletionsContent[] | null;
  tool_calls?: ChatCompletionsToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type ChatCompletionsRequestBody = {
  model: string;
  messages: ChatCompletionsMessage[];
  tools?: ChatCompletionsTool[];
  tool_choice?: ChatCompletionsToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: ChatCompletionsResponseFormat;
  stream?: boolean;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
};
