import {InterfacesUnion} from './utilityTypes';

export type ImageResult = InterfacesUnion<{url: string} | {base64: string}>;

export type ImageResults = ImageResult[];
