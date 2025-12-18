// https://docs.cohere.com/v2/reference/chat
export interface CohereChat {
  model?: string;
  temperature?: number;
  prompt_truncation?: 'AUTO' | 'OFF';
  connectors?: {id: string}[];
  documents?: {title: string; snippet: string}[];
}

export type Cohere = true | CohereChat;
