import {OpenAIMessage} from './openAI';

// example body for OpenAI
export interface OpenAIRequestBody {
  model: string;
  messages?: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestInterceptor = (requestBody: any) => any;
