export type MiniMaxContent =
  | {type: 'text'; text: string}
  | {type: 'image_url'; image_url: {url: string}}
  | {type: 'video_url'; video_url: {url: string}};

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MiniMaxContent[];
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
