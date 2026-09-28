import {ChatCompletionsToolCall} from './chatCompletionsInternal';

export type ChatCompletionsImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type ChatCompletionsError = {
  error?: {
    message: string;
    type: string;
    code?: string;
  };
};

export type ChatCompletionsResultMessage = {
  role: 'assistant';
  content: string | null;
  tool_calls?: ChatCompletionsToolCall[];
  images?: ChatCompletionsImageContent[];
};

export type ChatCompletionsResponse = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionsResultMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} & ChatCompletionsError;

export type ChatCompletionsStreamChoice = {
  index: number;
  delta: {
    role?: 'assistant';
    content?: string;
    images?: ChatCompletionsImageContent[];
    tool_calls?: ChatCompletionsToolCall[];
  };
  finish_reason?: string;
};

export type ChatCompletionsStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionsStreamChoice[];
  message?: ChatCompletionsResultMessage;
} & ChatCompletionsError;

export type ChatCompletionsAPIResult = ChatCompletionsResponse | ChatCompletionsStreamEvent;
