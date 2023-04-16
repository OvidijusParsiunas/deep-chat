import {GenericObject} from './object';
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

export interface RequestDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  headers?: GenericObject<string>;
}

export type RequestInterceptor = (details: RequestDetails) => RequestDetails;
