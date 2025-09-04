import {KimiToolCall} from './kimiInternal';

// https://platform.moonshot.ai/docs/api/chat#chat-completion
export type KimiResult = {
  id: string;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: 'assistant';
      content: string | null;
      tool_calls?: KimiToolCall[];
    };
    delta?: {
      role?: 'assistant';
      content?: string;
      tool_calls?: KimiToolCall[];
    };
    finish_reason?: string | 'tool_calls';
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

export type ToolAPI = {
  tool_calls?: KimiToolCall[];
};
