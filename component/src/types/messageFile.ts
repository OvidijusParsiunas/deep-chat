import {InterfacesUnion} from './utilityTypes';

export type MessageFileType = 'image' | 'audio' | 'file';

export type MessageFile = InterfacesUnion<
  {url: string; type: MessageFileType} | {base64: string; type: MessageFileType} | {name: string; type: MessageFileType}
>;

export type MessageFiles = MessageFile[];
