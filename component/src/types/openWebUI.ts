import {ChatFunctionHandler} from './openAI';

export interface OpenWebUITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: object;
  };
}

export interface OpenWebUIChat {
  model?: string;
  system_prompt?: string;
  tools?: OpenWebUITool[];
  tool_ids?: string[];
  function_handler?: ChatFunctionHandler;
  files?: {type: 'file' | 'collection'; id: string}[];
}

export type OpenWebUI = true | OpenWebUIChat;
