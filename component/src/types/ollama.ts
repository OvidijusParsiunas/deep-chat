import {ChatFunctionHandler} from './openAI';

export interface OllamaTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export interface OllamaChat {
  model?: string;
  system?: string;
  think?: boolean;
  keep_alive?: boolean;
  tools?: OllamaTool[];
  function_handler?: ChatFunctionHandler;
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
  };
}

export type Ollama = true | OllamaChat;
