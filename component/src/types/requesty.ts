import {ChatFunctionHandler} from './openAI';

export interface RequestyTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export type RequestyToolChoice = 'auto' | 'none' | 'required' | {type: 'function'; function: {name: string}};

export interface RequestyResponseFormat {
  type: 'text' | 'json_object' | 'json_schema';
  json_schema?: {
    name: string;
    description?: string;
    schema: object;
    strict?: boolean;
  };
}

export interface RequestyReasoning {
  effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
  exclude?: boolean;
  enabled?: boolean;
}

// https://docs.requesty.ai/
export interface RequestyChat {
  model?: string;
  models?: string[];
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
  system_prompt?: string;
  tools?: RequestyTool[];
  tool_choice?: RequestyToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: RequestyResponseFormat;
  reasoning?: RequestyReasoning;
  function_handler?: ChatFunctionHandler;
}

export type Requesty = true | RequestyChat;
