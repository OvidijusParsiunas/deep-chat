export type GroqToolCall = {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
};

export type GroqChoice = {
  index: number;
  finish_reason: string | null;
  message?: {
    role: string;
    content: string | null;
    tool_calls?: GroqToolCall[];
  };
  delta?: {
    role?: string;
    content?: string | null;
    tool_calls?: GroqToolCall[];
  };
};

export type GroqResult = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
};

export type GroqNormalResult = {
  index: number;
  message: {
    role: string;
    content: string;
    tool_calls?: GroqToolCall[];
  };
  finish_reason: string;
};

export type GroqStreamEvent = {
  index: number;
  delta: {
    role?: string;
    content?: string;
    tool_calls?: GroqToolCall[];
  };
  finish_reason: string | null;
};

export type ToolAPI = {
  tool_calls?: GroqToolCall[];
};