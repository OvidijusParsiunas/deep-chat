import {ChatFunctionHandler} from './openAI';

// https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
export interface ClaudeCacheControl {
  type: 'ephemeral';
  ttl?: '5m' | '1h';
}

// https://docs.anthropic.com/en/api/messages#body-tools
export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: object;
    required?: string[];
  };
  // https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/define-tools#providing-tool-use-examples
  input_examples?: Array<Record<string, unknown>>;
  // https://www.anthropic.com/engineering/advanced-tool-use
  defer_loading?: boolean;
  type?: string;
  allowed_callers?: string[];
  cache_control?: ClaudeCacheControl;
}

// https://docs.anthropic.com/en/api/messages#body-system
export interface ClaudeSystemBlock {
  type: 'text';
  text: string;
  cache_control?: ClaudeCacheControl;
}

// https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector#using-the-mcp-connector-in-the-messages-api
export interface ClaudeMCPServer {
  type: 'url';
  url: string;
  name: string;
  authorization_token?: string;
}

// https://docs.anthropic.com/en/api/messages#body-tool-choice
export type ClaudeToolChoice =
  | {type: 'auto'; disable_parallel_tool_use?: boolean}
  | {type: 'any'; disable_parallel_tool_use?: boolean}
  | {type: 'tool'; name: string; disable_parallel_tool_use?: boolean}
  | {type: 'none'};

// https://docs.anthropic.com/en/api/messages#body-metadata
export interface ClaudeMetadata {
  user_id?: string;
}

// https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
export type ClaudeThinking =
  | {type: 'enabled'; budget_tokens: number; display?: 'summarized' | 'omitted'}
  | {type: 'disabled'}
  | {type: 'adaptive'; display?: 'summarized' | 'omitted'};

// https://docs.anthropic.com/en/api/messages
export interface ClaudeChat {
  model?: string;
  max_tokens?: number;
  stop_sequences?: string[];
  system_prompt?: string | ClaudeSystemBlock[];
  tools?: ClaudeTool[];
  tool_choice?: ClaudeToolChoice;
  function_handler?: ChatFunctionHandler;
  mcp_servers?: ClaudeMCPServer[];
  metadata?: ClaudeMetadata;
  thinking?: ClaudeThinking;
  service_tier?: 'auto' | 'standard_only';
  inference_geo?: string;
  custom_base_url?: string;
  cache_control?: ClaudeCacheControl;
}

export type Claude = true | ClaudeChat;
