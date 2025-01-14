import {OpenAIChat} from './openAI';

export type URLDetails = {
  endpoint: string;
};

export interface OllamaOpenAI {
  urlDetails?: URLDetails;
  chat?: true | OpenAIChat;
}

export interface Ollama {
  openAI?: OllamaOpenAI;
}
