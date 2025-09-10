export type XImageResult = {
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
  error?: {
    message: string;
    type: string;
  };
};

export type XNormalResult = {
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

export type XStreamEvent = {
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

export type XResult = XNormalResult | XStreamEvent;
