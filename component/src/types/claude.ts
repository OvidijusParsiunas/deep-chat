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

// https://docs.anthropic.com/en/api/messages
export interface ClaudeChat {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  system_prompt?: string | ClaudeSystemBlock[];
  tools?: ClaudeTool[];
  tool_choice?: 'auto' | 'any' | {type: 'tool'; name: string} | {type: 'function'; name: string};
  function_handler?: ChatFunctionHandler;
  mcp_servers?: ClaudeMCPServer[];
  custom_base_url?: string;
  cache_control?: ClaudeCacheControl;
}

export type Claude = true | ClaudeChat;
