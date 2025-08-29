import {ClaudeTool, ClaudeMCPServer} from './claude';
import {ClaudeTextContent} from './claudeResult';

type ClaudeImageContent = {
  type: 'image';
  source: {
    type: 'base64';
    media_type: string;
    data: string;
  };
};

export type ClaudeContent = ClaudeTextContent | ClaudeImageContent;

export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string | ClaudeContent[];
};

export type ClaudeRequestBody = {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  stream?: boolean;
  tools?: ClaudeTool[];
  tool_choice?: 'auto' | 'any' | {type: 'tool'; name: string} | {type: 'function'; name: string};
  mcp_servers?: ClaudeMCPServer[];
};
