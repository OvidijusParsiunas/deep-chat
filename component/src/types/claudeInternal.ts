import {ClaudeTextContent} from './claudeResult';
import {
  ClaudeCacheControl,
  ClaudeSystemBlock,
  ClaudeToolChoice,
  ClaudeMCPServer,
  ClaudeMetadata,
  ClaudeThinking,
  ClaudeTool,
} from './claude';

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
  system?: string | ClaudeSystemBlock[];
  stream?: boolean;
  tools?: ClaudeTool[];
  tool_choice?: ClaudeToolChoice;
  mcp_servers?: ClaudeMCPServer[];
  metadata?: ClaudeMetadata;
  thinking?: ClaudeThinking;
  service_tier?: 'auto' | 'standard_only';
  inference_geo?: string;
  cache_control?: ClaudeCacheControl;
};
