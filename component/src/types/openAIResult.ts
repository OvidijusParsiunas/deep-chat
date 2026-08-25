import {InterfacesUnion} from './utilityTypes';

export type ToolCalls = {function: {name: string; arguments: string}; id: string}[];

export interface ToolAPI {
  call_id?: string;
  name?: string;
}

export type OpenAIMessage = {
  role: 'user' | 'system' | 'ai' | 'tool';
  content: [{text: string; type?: string; image_url?: string}];
  audio?: {data: string; transcript: string};
  status?: string;
  type?: string;
} & ToolAPI;

export type OpenAITextToSpeechResult = Blob | {error?: {code: string; message: string}};

export interface OpenAIConverseResult {
  usage: {total_tokens: number};
  error?: {code: string; message: string};
}

export type OpenAIOutput = (OpenAIMessage | ResponsesFunctionCall | ResponsesImageGenerationCall)[];

// Unified OpenAI result type for all streaming and non-streaming responses
export interface OpenAIResult {
  // Responses API properties
  id?: string;
  status?: 'completed' | 'queued' | 'in_progress' | 'failed';
  output_text?: string;
  output?: OpenAIOutput;
  usage?: {total_tokens: number};

  // Stream properties
  delta?: string;

  // Streaming event properties
  type?: string;
  sequence_number?: number;
  item_id?: string;
  output_index?: number;
  arguments?: string;
  item?: {
    id: string;
    type: 'function_call';
    status: string;
    arguments: string;
    call_id: string;
    name: string;
  };

  // Image generation streaming properties
  partial_image_index?: number;
  partial_image_b64?: string;

  // Error handling
  error?: {code?: string; message: string};
}

export interface ResponsesFunctionCall {
  id: string;
  call_id: string;
  status?: string;
  type: 'function_call';
  name: string;
  arguments: string;
}

export interface ResponsesImageGenerationCall {
  id: string;
  call_id: string;
  type: 'image_generation_call';
  status: 'completed' | 'in_progress' | 'failed';
  revised_prompt?: string;
  result: string;
}

export interface OpenAIImageResult {
  data: InterfacesUnion<{url: string} | {b64_json: string}>[];
  error?: {code: string; message: string};
}

export interface OpenAIAudioResult {
  text: string;
  error?: {code: string; message: string};
}

export type OpenAIConverseMessage = {
  role: 'user' | 'system' | 'ai' | 'tool';
  content: string;
  audio?: {data: string; transcript: string};
  tool_calls?: ToolCalls;
  tool_call_id?: string;
  name?: string;
};

// text for completion request & stream
// message for chat completion request
// delta for chat completion stream
export type OpenAICompletionsResultChoice = InterfacesUnion<
  {text: string} | {message: OpenAIConverseMessage} | {delta: OpenAIConverseMessage; finish_reason?: string}
>;

export interface OpenAICompletionsResult {
  choices: OpenAICompletionsResultChoice[];
  usage: {total_tokens: number};
  error?: {code: string; message: string};
}
