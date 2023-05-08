import {InterfacesUnion} from './utilityTypes';

export interface HuggingFaceError {
  error: string | string[];
  estimated_time?: number;
}

export type HuggingConversationResult = InterfacesUnion<{generated_text: string} | HuggingFaceError>;

export type HuggingFaceTextGenerationResult = InterfacesUnion<{generated_text: string}[] | HuggingFaceError>;

export type HuggingFaceSummarizeResult = InterfacesUnion<{summary_text: string}[] | HuggingFaceError>;

export type HuggingFaceTranslationResult = InterfacesUnion<{translation_text: string}[] | HuggingFaceError>;

// the component extracts first sequence (which has the highest score)
export type HuggingFillMaskResult = InterfacesUnion<{sequence: string}[] | HuggingFaceError>;

export type HuggingQuestionAnswerResult = InterfacesUnion<{answer: string} | HuggingFaceError>;
