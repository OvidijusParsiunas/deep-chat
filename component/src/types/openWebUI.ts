import {ChatFunctionHandler} from './openAI';

export interface OpenWebUIChat {
  model?: string;
  system_prompt?: string;
  tool_ids?: string[];
  tools?: object[];
  function_handler?: ChatFunctionHandler;
  files?: {type: 'file' | 'collection'; id: string}[];
}

export type OpenWebUI = true | OpenWebUIChat;
