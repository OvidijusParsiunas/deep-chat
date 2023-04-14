import {OpenAIConverseConfig, OpenAIMessage} from './openAI';

export interface SystemMessageInternal {
  role: 'system';
  content: string;
}

export type OpenAIConverseBodyInternal = OpenAIConverseConfig & {
  model: string;
  messages?: OpenAIMessage[]; // only for chat
};
