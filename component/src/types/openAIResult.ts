import {InterfacesUnion} from './utilityTypes';
import {OpenAIMessage} from './openAI';

// text for completion request & stream
// message for chat completion request
// delta for chat completion stream
type ResultChoice = InterfacesUnion<{text: string} | {message: OpenAIMessage} | {delta: OpenAIMessage}>;

export interface OpenAIConverseResult {
  choices: ResultChoice[];
  usage: {total_tokens: number};
  error?: {code: string; message: string};
}

export interface OpenAIImageResult {
  data: InterfacesUnion<{url: string} | {b64_json: string}>[];
  error?: {code: string; message: string};
}
