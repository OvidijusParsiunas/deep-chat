import {ChatFunctionHandler} from './openAI';

// Shared types for OpenAI-compatible Chat Completions providers
// https://platform.openai.com/docs/api-reference/chat/create

export interface ChatCompletionsTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export type ChatCompletionsToolChoice = 'auto' | 'none' | 'required' | {type: 'function'; function: {name: string}};

export interface ChatCompletionsResponseFormat {
  type: 'text' | 'json_object' | 'json_schema';
  json_schema?: {
    name: string;
    description?: string;
    schema: object;
    strict?: boolean;
  };
}

export interface ChatCompletionsChat {
  model?: string;
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
  system_prompt?: string;
  tools?: ChatCompletionsTool[];
  tool_choice?: ChatCompletionsToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: ChatCompletionsResponseFormat;
  function_handler?: ChatFunctionHandler;
}
