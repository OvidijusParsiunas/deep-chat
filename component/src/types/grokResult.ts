export type GrokImageResult = {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
};

export type GrokNormalResult = {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
  };
};

export type GrokStreamEvent = {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason?: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
};

export type GrokResult = GrokNormalResult | GrokStreamEvent;
