import {InterfacesUnion} from './utilityTypes';

export interface HuggingFaceError {
  error: string | string[];
  estimated_time?: number;
}

export type HuggingFaceTextGenerationResult = InterfacesUnion<{generated_text: string}[] | HuggingFaceError>;

export type HuggingFaceSummarizeResult = InterfacesUnion<{summary_text: string}[] | HuggingFaceError>;
