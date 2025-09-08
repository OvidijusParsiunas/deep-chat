import {ChatFunctionHandler} from './openAI';

// https://docs.mistral.ai/api/#tag/chat/operation/chat_completion_v1_chat_completions_post
export type Mistral = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  random_seed?: number;
  n?: number;
  safe_mode?: boolean;
  reasoning_mode?: string;
  presence_penalty?: number;
  frequency_penalty?: number;
  tools?: {type: 'function'; function: {name: string; description?: string; parameters: object}}[];
  tool_choice?: 'auto' | 'any' | 'none' | {type: 'function'; function: {name: string}};
  function_handler?: ChatFunctionHandler;
};
