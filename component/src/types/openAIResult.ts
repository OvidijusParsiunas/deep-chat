import {InterfacesUnion} from './utilityTypes';
import {OpenAIMessage} from './openAI';

// text for completion request & stream
// message for chat completion request
// delta for chat completion strea,
type ResultChoice = InterfacesUnion<{text: string} | {message: OpenAIMessage} | {delta: OpenAIMessage}>;

export interface OpenAIResult {
  choices: ResultChoice[];
  error?: {code: string};
}
