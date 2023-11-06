import {InterfacesUnion} from './utilityTypes';

export type ToolCalls = {function: {name: string; arguments: string}; id: string}[];

export interface ToolAPI {
  tool_calls?: ToolCalls;
  tool_call_id?: string;
  name?: string;
}

export type OpenAIMessage = {
  role: 'user' | 'system' | 'ai' | 'tool';
  content: string;
} & ToolAPI;

export type OpenAIAudioType = {
  type?: 'transcription' | 'translation';
};

// https://platform.openai.com/docs/api-reference/audio/create
export type OpenAIAudio = {
  model?: 'whisper-1';
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
};

// https://platform.openai.com/docs/api-reference/images
export interface OpenAIImages {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export type FunctionHandlerResponse = InterfacesUnion<
  {text?: string} | {tool_call_id: string; name: string; content: string}[]
>;

export type FunctionHandler = (toolCalls: ToolCalls) => FunctionHandlerResponse | Promise<FunctionHandlerResponse>;

export interface OpenAIToolsAPI {
  // parameters use the JSON Schema type
  tools?: {type: 'function'; function: {name: string; description?: string; parameters: object}}[];
  tool_choice?: 'auto' | {type: 'function'; function: {name: string}};
  function_handler?: FunctionHandler;
}

// totalMessagesMaxCharLength must include system_prompt length
export type OpenAIChat = {system_prompt?: string} & OpenAIToolsAPI;

// https://platform.openai.com/docs/api-reference/chat/create
// https://platform.openai.com/docs/api-reference/completions
export interface OpenAIConverse {
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
}

export interface OpenAI {
  chat?: true | (OpenAIConverse & OpenAIChat);
  completions?: true | OpenAIConverse;
  images?: true | OpenAIImages;
  audio?: true | (OpenAIAudio & OpenAIAudioType);
}
