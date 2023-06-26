import {InterfacesUnion} from './utilityTypes';

export type MessageFileType = 'image' | 'gif' | 'audio' | 'any';

export type MessageFileMarker = InterfacesUnion<{src: string} | {base64: string}>;

export type MessageFile = Partial<MessageFileMarker> & {name?: string; type?: MessageFileType};

export type MessageFiles = MessageFile[];
