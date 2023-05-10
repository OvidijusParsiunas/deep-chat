import {InterfacesUnion} from './utilityTypes';

export type AzureTextToSpeechResult = Blob;

export type AzureKeyRetrievalResult = InterfacesUnion<Blob | {error: string}>;
