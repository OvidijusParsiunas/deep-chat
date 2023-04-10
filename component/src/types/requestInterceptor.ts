import {OpenAIMessage} from './openAI';

export interface RequestBody {
  model: string;
  messages?: OpenAIMessage[]; // only for chat
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export type RequestInterceptor = (requestBody: RequestBody) => object;
