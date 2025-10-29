export interface BaseTool {
  type: string;
}

export interface FunctionTool extends BaseTool {
  type: 'function';
  name: string;
  description?: string;
  parameters?: object;
  strict: true;
}

export interface WebSearchTool extends BaseTool {
  type: 'web_search';
  filters?: {allowed_domains?: string[]};
  search_context_size?: 'low' | 'medium' | 'high';
  user_location?: {
    city?: string;
    country?: string;
    region?: string;
    timezone?: string;
    type?: 'approximate';
  };
}

export interface FileSearchFilter {
  key: string;
  type: string;
  value: string | number | boolean;
}

export interface FileSearchTool extends BaseTool {
  type: 'file_search';
  vector_store_ids: string[];
  filters?: FileSearchFilter | {filters: FileSearchFilter[]; type: 'and' | 'or'};
  max_num_results?: string;
  ranking_options?: {ranker?: string; score_threshold?: number};
}

export interface ImageGenerationTool extends BaseTool {
  type: 'image_generation';
  background?: string;
  input_fidelity?: string;
  input_image_mask?: {file_id?: string; image_url?: string};
  model?: string;
  moderation?: string;
  output_compression?: number;
  output_format?: string;
  partial_images?: number;
  quality?: string;
  size?: string;
}

// MCP (Model Context Protocol) tool configuration
// https://platform.openai.com/docs/guides/tools-remote-mcp
export interface MCPTool extends BaseTool {
  type: 'mcp';
  server_label: string;
  server_description?: string;
  server_url: string;
  require_approval?:
    | 'never'
    | 'always'
    | {
        never?: {
          tool_names: string[];
        };
      };
  allowed_tools?: string[];
  authorization?: string;
}

export type OpenAITool = FunctionTool | WebSearchTool | FileSearchTool | ImageGenerationTool | MCPTool;
