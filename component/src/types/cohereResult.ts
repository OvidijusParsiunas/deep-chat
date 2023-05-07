import {InterfacesUnion} from './utilityTypes';

type ErrorMessage = {
  message?: string;
};

type CompletionsResult = {
  generations: {id: string; text: string}[];
};

export type CohereCompletionsResult = InterfacesUnion<CompletionsResult | ErrorMessage>;

type SummarizeResult = {
  summary: string;
};

export type CohereSummarizeResult = InterfacesUnion<SummarizeResult | ErrorMessage>;
