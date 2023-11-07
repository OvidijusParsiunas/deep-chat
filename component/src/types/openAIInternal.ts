import {OpenAIMessage} from './openAIResult';
import {OpenAIConverse} from './openAI';

export interface SystemMessageInternal {
  role: 'system';
  content: string;
}

export type OpenAIConverseBodyInternal = OpenAIConverse & {
  model: string;
  messages?: OpenAIMessage[]; // only for chat
};
