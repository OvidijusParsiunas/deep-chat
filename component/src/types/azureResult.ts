import {InterfacesUnion} from './utilityTypes';

export type AzureTextToSpeechResult = Blob;

export type AzureSpeechToTextResult = InterfacesUnion<{DisplayText: string} | {error: string}>;

export type AzureKeyRetrievalResult = InterfacesUnion<Blob | {error: string}>;
