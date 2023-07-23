import {InterfacesUnion} from './utilityTypes';

type ErrorMessage = {
  message?: string;
};

type ChatResult = {
  text: string;
};

export type CohereChatResult = InterfacesUnion<ChatResult | ErrorMessage>;

type CompletionsResult = {
  generations: {id: string; text: string}[];
};

export type CohereCompletionsResult = InterfacesUnion<CompletionsResult | ErrorMessage>;

type SummarizationResult = {
  summary: string;
};

export type CohereSummarizationResult = InterfacesUnion<SummarizationResult | ErrorMessage>;
