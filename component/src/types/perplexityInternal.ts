export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityRequestBody {
  model: string;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  search_mode?: 'web' | 'academic';
  reasoning_effort?: 'low' | 'medium' | 'high';
  search_domain_filter?: string[];
  disable_search?: boolean;
  enable_search_classifier?: boolean;
  stream?: boolean;
}