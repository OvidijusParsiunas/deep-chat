// https://docs.cohere.com/v2/reference/chat
export interface CohereChatConfig {
  model?: string;
  temperature?: number;
  prompt_truncation?: 'AUTO' | 'OFF';
  connectors?: {id: string}[];
  documents?: {title: string; snippet: string}[];
}

export interface Cohere {
  chat?: true | CohereChatConfig;
}
