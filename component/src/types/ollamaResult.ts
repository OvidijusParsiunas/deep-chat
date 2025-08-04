export interface OllamaMessage {
  role: 'assistant';
  content: string | null;
  tool_calls?: OllamaToolCall[];
}

export interface OllamaToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OllamaConverseResult {
  model?: string;
  created_at?: string;
  message?: OllamaMessage;
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  error?: {
    message: string;
  };
  text?: string;
}

export interface OllamaStreamResult {
  model?: string;
  created_at?: string;
  message?: OllamaMessage;
  done?: boolean;
}
