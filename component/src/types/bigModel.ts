import {ChatFunctionHandler} from './openAI';

export type BigModelTextToSpeech = {
  model?: string;
  voice?: string;
};

export type BigModelImages = {
  model?: string;
};

export type BigModelChat = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  function_handler?: ChatFunctionHandler;
};

export interface BigModel {
  chat?: true | BigModelChat;
  images?: true | BigModelImages;
  textToSpeech?: true | BigModelTextToSpeech;
}
