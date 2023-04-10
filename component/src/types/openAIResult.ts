import {InterfacesUnion} from './utilityTypes';
import {OpenAIMessage} from './openAI';

// text for completion request & stream
// message for chat completion request
// delta for chat completion stream
type ResultChoice = InterfacesUnion<{text: string} | {message: OpenAIMessage} | {delta: OpenAIMessage}>;

export interface OpenAIResult {
  choices: ResultChoice[];
  usage: {total_tokens: number};
  error?: {code: string; message: string};
}
