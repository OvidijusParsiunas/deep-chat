import {ChatFunctionHandler} from './openAI';

export type BigModelTextToSpeech = {
  model?: string;
  voice?: string;
};

export type BigModelImages = {
  model?: string;
};

export interface BigModelChatFunctions {
  tools?: {type: 'function'; function: {name: string; description?: string; parameters: object}}[];
  tool_choice?: 'auto' | {type: 'function'; function: {name: string}};
  function_handler?: ChatFunctionHandler;
}

export type BigModelChat = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
} & BigModelChatFunctions;

export interface BigModel {
  chat?: true | BigModelChat;
  images?: true | BigModelImages;
  textToSpeech?: true | BigModelTextToSpeech;
}
