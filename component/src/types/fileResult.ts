import {InterfacesUnion} from './utilityTypes';

export type FileResult = InterfacesUnion<{url: string} | {base64: string}>;

export type FileResults = FileResult[];
