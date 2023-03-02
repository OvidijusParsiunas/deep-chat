import {OpenAIMessage} from './openAI';

type ResultChoice = {text: string; message: never} | {message: OpenAIMessage; text: never};

export interface OpenAIResult {
  choices: ResultChoice[];
  error?: {code: string};
}
