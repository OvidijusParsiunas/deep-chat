import {OpenAIMessage} from './openAIResult';
import {OpenAIChat} from './openAI';

export interface SystemMessageInternal {
  role: 'system';
  content: string;
}

export type OpenAIConverseBodyInternal = OpenAIChat & {
  model: string;
  messages?: OpenAIMessage[]; // only for chat
};
