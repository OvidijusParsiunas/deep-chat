export type ClaudeToolUse = {
  type: 'tool_use';
  id: string;
  name: string;
  input: string;
};

export type ClaudeTextContent = {
  type: 'text';
  text: string;
};

type ClaudeContentResponse = Array<ClaudeTextContent | ClaudeToolUse>;

type ClaudeNormalResult = {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ClaudeContentResponse;
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

export type ClaudeStreamEvent = {
  type:
    | 'content_block_delta'
    | 'message_start'
    | 'content_block_start'
    | 'content_block_stop'
    | 'message_delta'
    | 'message_stop'
    | 'content_block_start'
    | 'content_block_stop'
    | 'content_block_delta';
  delta?: {
    type: 'text_delta' | 'input_json_delta';
    text?: string;
    partial_json?: string;
    stop_reason?: 'tool_use';
  };
  content_block?: ClaudeToolUse;
  content?: ClaudeContentResponse;
  error?: {
    type: string;
    message: string;
  };
};

// https://docs.anthropic.com/en/api/messages
export type ClaudeResult = ClaudeNormalResult | ClaudeStreamEvent;
