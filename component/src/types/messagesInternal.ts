import {MessageElements} from '../views/chat/messages/messages';
import {MessageFile, MessageFileType} from './messageFile';
import {PropsRequired} from './utilityTypes';
import {MessageContent} from './messages';

export type MessageBody = {text?: string; files?: MessageFile[]; html?: string};

export type MessageBodyElements = {text?: MessageElements; files?: MessageElements[]; html?: MessageElements};

export type MessageToElements = [MessageContentI, MessageBodyElements][];

export type MessageContentI = PropsRequired<MessageContent, 'role'>;

// eslint-disable-next-line
export type UserContentI = {text?: string; files?: {file: File; type: MessageFileType}[]; custom?: any};

// if message did not overwrite, create a new message
export interface Overwrite {
  status?: boolean;
}
