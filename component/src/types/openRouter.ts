import {ChatFunctionHandler} from './openAI';

export interface OpenRouterTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export type OpenRouterToolChoice = 'auto' | 'none' | 'required' | {type: 'function'; function: {name: string}};

export interface OpenRouterResponseFormat {
  type: 'text' | 'json_object' | 'json_schema';
  json_schema?: {
    name: string;
    description?: string;
    schema: object;
    strict?: boolean;
  };
}

export interface OpenRouterReasoning {
  effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
  exclude?: boolean;
  enabled?: boolean;
}

// https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request
export interface OpenRouterChat {
  model?: string;
  models?: string[];
  max_tokens?: number;
  max_completion_tokens?: number;
  stop?: string | string[];
  system_prompt?: string;
  tools?: OpenRouterTool[];
  tool_choice?: OpenRouterToolChoice;
  parallel_tool_calls?: boolean;
  response_format?: OpenRouterResponseFormat;
  reasoning?: OpenRouterReasoning;
  function_handler?: ChatFunctionHandler;
}

export type OpenRouter = true | OpenRouterChat;
