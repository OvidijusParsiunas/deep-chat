export interface OpenWebUIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenWebUIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_token_s?: number;
  'response_token/s'?: number;
  'prompt_token/s'?: number;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  approximate_total?: string;
  completion_tokens_details?: {
    reasoning_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
  };
}

export interface OpenWebUIStreamResult {
  id?: string;
  created?: number;
  model?: string;
  choices?: [
    {
      index?: number;
      logprobs?: null;
      finish_reason?: string | null;
      delta?: {
        content?: string;
        tool_calls?: OpenWebUIToolCall[];
      };
    },
  ];
  object?: string;
  usage?: OpenWebUIUsage;
}

export interface OpenWebUIMessage {
  content?: string;
  tool_calls?: OpenWebUIToolCall[];
  role?: string;
}

export interface OpenWebUIConverseResult {
  choices?: [
    {
      index?: number;
      message?: OpenWebUIMessage;
      finish_reason?: string | null;
      logprobs?: null;
    },
  ];
  message?: OpenWebUIMessage;
  error?: {
    message: string;
    type?: string;
    code?: string;
  };
  text?: string;
  id?: string;
  created?: number;
  model?: string;
  object?: string;
  usage?: OpenWebUIUsage;
}
