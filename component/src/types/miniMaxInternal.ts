export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxRequestBody {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}