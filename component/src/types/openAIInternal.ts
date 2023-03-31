import {OpenAIMessage} from './openAI';

export interface OpenAIInternalBody {
  model: string;
  // unseen messages e.g. system - https://platform.openai.com/docs/guides/chat/introduction
  initMessages?: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
}

export interface OpenAIInternal {
  chat: OpenAIInternalBody;
  completions: OpenAIInternalBody;
}
