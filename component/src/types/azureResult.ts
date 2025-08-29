import {InterfacesUnion} from './utilityTypes';

export type AzureTextToSpeechResult = Blob;

export type AzureSpeechToTextResult = InterfacesUnion<{DisplayText: string} | {error: string}>;

export type AzureKeyRetrievalResult = InterfacesUnion<Blob | {error: string}>;

export interface AzureAuthenticationError {
  error: {
    message: string;
  };
}

export type AzureSummarizationResult = InterfacesUnion<
  | {
      errors: string[];
      status: 'succeeded' | 'running';
      tasks: {
        items: [{status: string; results: {documents: [{sentences: [{text: string}]; warnings: []}]; errors: string[]}}];
      };
    }
  | {error: {code: string}}
>;

export type AzureTranslationResult = [{translations: {text: string}[]}] | {error: {code: number}};
