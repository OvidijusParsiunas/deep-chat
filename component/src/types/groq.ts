import {ChatFunctionHandler} from './openAI';

// https://console.groq.com/docs/api-reference#audio-speechCalled
export type GroqTextToSpeech = {
  model?: string;
  voice?: string;
  speed?: number;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
};

// https://console.groq.com/docs/api-reference#chat-create
export type GroqChat = {
  system_prompt?: string;
  model?: string;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
  seed?: number;
  tools?: object[];
  // https://console.groq.com/docs/tool-use
  tool_choice?: 'none' | 'auto' | 'required' | {type: 'function'; function: {name: string}};
  function_handler?: ChatFunctionHandler;
  parallel_tool_calls?: boolean;
};

export interface Groq {
  chat?: true | GroqChat;
  textToSpeech?: true | GroqTextToSpeech;
}
