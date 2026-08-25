import {OpenAIRealtime} from './openAIRealtime';
import {OpenAITool} from './openAITools';

// https://platform.openai.com/docs/api-reference/chat
// https://platform.openai.com/docs/guides/audio?example=audio-in
export type OpenAICompletions = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
  modalities?: ['text', 'audio'];
  audio?: {format: string; voice: string};
} & OpenAIChatFunctions;

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
export interface OpenAIImagesDalle2 {
  model?: 'dall-e-2';
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

// https://platform.openai.com/docs/api-reference/images
export interface OpenAIImagesDalle3 {
  model: 'dall-e-3';
  quality?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export type FunctionsDetails = {name: string; arguments: string}[];

export type ChatFunctionHandlerResponse = {response: string}[] | {text: string};

export type ChatFunctionHandler = (
  functionsDetails: FunctionsDetails
) => ChatFunctionHandlerResponse | Promise<ChatFunctionHandlerResponse> | Promise<{response: string}>[];

export interface OpenAIChatFunctions {
  tools?: OpenAITool[];
  max_tool_calls?: number;
  parallel_tool_calls?: boolean;
  tool_choice?:
    | 'auto'
    | 'required'
    | 'none'
    | {mode: 'auto' | 'required'; type: 'allowed_tools'; tools: OpenAITool[]}
    | {type: string; name?: string; server_label?: string};
  function_handler?: ChatFunctionHandler;
}

// https://platform.openai.com/docs/api-reference/responses/create
export type OpenAIChat = {
  model?: string;
  instructions?: string;
  background?: boolean;
  max_output_tokens?: number;
  reasoning?: {effort?: string; summary?: string};
  safety_identifier?: string;
  service_tier?: string;
  store?: boolean;
  temperature?: number;
  top_p?: number;
  truncation?: string;
  conversation?: boolean | string;
  conversationLoadLimit?: number;
  custom_base_url?: string;
} & OpenAIChatFunctions;

export interface OpenAI {
  chat?: true | OpenAIChat;
  realtime?: true | OpenAIRealtime;
  completions?: true | OpenAICompletions;
  images?: true | OpenAIImagesDalle2 | OpenAIImagesDalle3;
  textToSpeech?: true | OpenAITextToSpeech;
  speechToText?: true | OpenAISpeechToText;
}
