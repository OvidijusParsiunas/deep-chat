export interface MiniMaxChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    content: string;
  };
  finish_reason?: string;
}

export interface MiniMaxUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface MiniMaxResult {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MiniMaxChoice[];
  usage?: MiniMaxUsage;
  base_resp?: {
    status_code: number;
    status_msg: string;
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}
