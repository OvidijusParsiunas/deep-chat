export interface PerplexityChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    content: string;
  };
  finish_reason?: string;
}

export interface PerplexityUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface PerplexityResult {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: PerplexityChoice[];
  usage?: PerplexityUsage;
  search_results?: PerplexitySearchResult[];
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}