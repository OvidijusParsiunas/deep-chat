import {OpenAIMessage} from './openAIBodies';

export interface OpenAIRequestBody {
  model: string;
  // only for chat
  messages?: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export type RequestInterceptor = (requestBody: OpenAIRequestBody) => object;
