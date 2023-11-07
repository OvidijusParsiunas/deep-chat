import {InterfacesUnion} from './utilityTypes';

// https://platform.openai.com/docs/api-reference/audio/createSpeech
export type OpenAITextToSpeech = {
  model?: string;
  voice?: string;
  speed?: number;
};

// https://platform.openai.com/docs/guides/speech-to-text
// https://platform.openai.com/docs/api-reference/audio/createTranscription
// https://platform.openai.com/docs/api-reference/audio/create
export type OpenAISpeechToText = {
  model?: string;
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
  type?: 'transcription' | 'translation';
};

// https://platform.openai.com/docs/api-reference/images
export interface OpenAIImages {
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export type FunctionHandlerResponse = InterfacesUnion<{text?: string} | {response: string}[]>;

export type FunctionsDetails = {name: string; arguments: string}[];

export type FunctionHandler = (
  functionsDetails: FunctionsDetails
) => FunctionHandlerResponse | Promise<FunctionHandlerResponse>;

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
  speechToText?: true | OpenAISpeechToText;
  textToSpeech?: true | OpenAITextToSpeech;
}
