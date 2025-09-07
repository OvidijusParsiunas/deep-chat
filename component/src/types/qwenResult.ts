import {QwenToolCall} from './qwenInternal';

// https://www.alibabacloud.com/help/en/model-studio/use-qwen-by-calling-api
export type QwenResult = {
  id: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: 'assistant';
      content: string | null;
      tool_calls?: QwenToolCall[];
    };
    delta?: {
      role?: 'assistant';
      content?: string;
      tool_calls?: QwenToolCall[];
    };
    finish_reason?: 'stop' | 'length' | 'tool_calls' | string;
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

export interface ToolAPI {
  tool_calls?: QwenToolCall[];
}

