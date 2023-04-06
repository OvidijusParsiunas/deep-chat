import {InterfacesUnion} from './utilityTypes';
import {OpenAIMessage} from './openAIBodies';

// text for completion request & stream
// message for chat completion request
// delta for chat completion stream
type ResultChoice = InterfacesUnion<{text: string} | {message: OpenAIMessage} | {delta: OpenAIMessage}>;

export interface OpenAIResult {
  choices: ResultChoice[];
  error?: {code: string; message: string};
}
