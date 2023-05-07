import {InterfacesUnion} from './utilityTypes';

type ErrorMessage = {
  message?: string;
};

type CompletionResult = {
  generations: {id: string; text: string}[];
};

export type CohereResult = InterfacesUnion<CompletionResult | ErrorMessage>;
