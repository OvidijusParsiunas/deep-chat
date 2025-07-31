type ClaudeNormalResult = {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{type: 'text'; text: string}>;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: {
    type: string;
    message: string;
  };
};

type ClaudeStreamEvent = {
  type:
    | 'content_block_delta'
    | 'message_start'
    | 'content_block_start'
    | 'content_block_stop'
    | 'message_delta'
    | 'message_stop';
  delta?: {
    type: 'text_delta';
    text?: string;
  };
  content?: Array<{type: 'text'; text: string}>;
  error?: {
    type: string;
    message: string;
  };
};

// https://docs.anthropic.com/en/api/messages
export type ClaudeResult = ClaudeNormalResult | ClaudeStreamEvent;
