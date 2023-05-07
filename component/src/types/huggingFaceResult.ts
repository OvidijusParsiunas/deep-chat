import {InterfacesUnion} from './utilityTypes';

export interface HuggingFaceTextGenerationResult {
  generated_text: string;
}

export interface HuggingFaceError {
  error: string | string[];
}

export type HuggingFaceResult = InterfacesUnion<HuggingFaceTextGenerationResult[] | HuggingFaceError>;
