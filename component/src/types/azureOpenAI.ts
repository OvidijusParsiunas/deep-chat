import {InterfacesUnion} from './utilityTypes';

// https://platform.openai.com/docs/api-reference/audio/createSpeech
export type AzureOpenAITextToSpeech = {
  model?: string;
  voice?: string;
  speed?: number;
};

// https://platform.openai.com/docs/guides/speech-to-text
// https://platform.openai.com/docs/api-reference/audio/createTranscription
// https://platform.openai.com/docs/api-reference/audio/create
export type AzureOpenAISpeechToText = {
  model?: string;
  temperature?: number;
  language?: string; // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes - 639-1 format
  type?: 'transcription' | 'translation';
};

// https://platform.openai.com/docs/api-reference/images
export interface AzureOpenAIImagesDalle2 {
  model?: 'dall-e-2';
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

// https://platform.openai.com/docs/api-reference/images
export interface AzureOpenAIImagesDalle3 {
  model: 'dall-e-3';
  quality?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
  user?: string;
}

export type FunctionsDetails = {name: string; arguments: string}[];

export type AssistantFunctionHandlerResponse = string[] | Promise<string>[];

export type AssistantFunctionHandler = (functionsDetails: FunctionsDetails) => AssistantFunctionHandlerResponse;

// https://platform.openai.com/docs/api-reference/assistants/createAssistant
export interface AzureOpenAINewAssistant {
  model?: string;
  name?: string;
  description?: string;
  instructions?: string;
  tools?: {
    type: 'code_interpreter' | 'file_search' | 'function';
    function?: {name: string; description?: string; parameters?: object};
  }[];
  tool_resources?: {
    code_interpreter?: {
      file_ids: string[];
    };
    file_search?: {
      vector_store_ids?: string[];
      vector_stores: {file_ids: string[]};
    };
  };
}

export type FileToolTypes = 'code_interpreter' | 'file_search' | 'images';

// https://platform.openai.com/docs/api-reference/assistants
export interface AzureOpenAIAssistant {
  assistant_id?: string;
  thread_id?: string;
  load_thread_history?: boolean;
  new_assistant?: AzureOpenAINewAssistant;
  // if image is uploaded and this is undefined, it will default to images
  // images can be used without a file tool type
  files_tool_type?: FileToolTypes | ((fileNames: string[]) => FileToolTypes);
  function_handler?: AssistantFunctionHandler;
}

export type ChatFunctionHandlerResponse = InterfacesUnion<{response: string}[] | {text: string}>;

export type ChatFunctionHandler = (
  functionsDetails: FunctionsDetails
) => ChatFunctionHandlerResponse | Promise<ChatFunctionHandlerResponse>;

export interface AzureOpenAIChatFunctions {
  // parameters use the JSON Schema type
  tools?: {type: 'function' | 'object'; function: {name: string; description?: string; parameters: object}}[];
  tool_choice?: 'auto' | {type: 'function'; function: {name: string}};
  function_handler?: ChatFunctionHandler;
}

// https://platform.openai.com/docs/api-reference/chat
export type AzureOpenAIChat = {
  system_prompt?: string;
  model?: string;
  max_tokens?: number; // number of tokens to reply - recommended to be set by the client
  temperature?: number;
  top_p?: number;
} & AzureOpenAIChatFunctions;

export interface AzureOpenAI {
  endpoint: string;
  version: string;
  deploymentId?: string;
  chat?: true | AzureOpenAIChat;
  assistant?: true | AzureOpenAIAssistant;
  images?: true | AzureOpenAIImagesDalle2 | AzureOpenAIImagesDalle3;
  textToSpeech?: true | AzureOpenAITextToSpeech;
  speechToText?: true | AzureOpenAISpeechToText;
}
