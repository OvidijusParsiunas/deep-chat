import {OpenAIConfig, OpenAIMessage} from './openAI';

export interface SystemMessageInternal {
  role: 'system';
  content: string;
}

export type OpenAIBodyInternal = OpenAIConfig & {
  model: string;
  messages?: OpenAIMessage[]; // only for chat
};
