import {OllamaTool} from './ollama';

export interface SystemMessageInternal {
  role: 'system';
  content: string;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  tool_calls?: OllamaToolCall[];
  tool_call_id?: string;
  name?: string;
  images?: string[];
}

export interface OllamaToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OllamaConverseBodyInternal {
  model: string;
  messages: OllamaMessage[];
  tools?: OllamaTool[];
  stream?: boolean;
}
