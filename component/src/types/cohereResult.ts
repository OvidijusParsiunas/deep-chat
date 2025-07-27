import {InterfacesUnion} from './utilityTypes';

type ErrorMessage = {
  message?: string;
};

type ChatResult =
  | {
      text: string;
    }
  | {
      message: {
        content: Array<{text: string}>;
      };
    };

export type CohereStreamEventBody = {
  type:
    | 'message-start'
    | 'content-start'
    | 'content-delta'
    | 'content-end'
    | 'tool-plan-delta'
    | 'tool-call-start'
    | 'tool-call-delta'
    | 'tool-call-end'
    | 'citation-start'
    | 'citation-end'
    | 'message-end';
  index?: number;
  id?: string;
  delta?: {
    message?: {
      content?: {
        text?: string;
        type?: string;
      };
      role?: string;
      tool_plan?: string;
    };
    text?: string; // Added for v2 API format
  };
  message?: {
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
    tool_plan?: string;
  };
  error?: {
    type: string;
    message: string;
  };
};

type CohereStreamEvent = {
  text: string;
};

export type CohereChatResult = InterfacesUnion<ChatResult | ErrorMessage | CohereStreamEvent>;

type CompletionsResult = {
  generations: {id: string; text: string}[];
};

export type CohereCompletionsResult = InterfacesUnion<CompletionsResult | ErrorMessage>;

type SummarizationResult = {
  summary: string;
};

export type CohereSummarizationResult = InterfacesUnion<SummarizationResult | ErrorMessage>;
