import {MessageFileType} from './messageFile';
import {PropsRequired} from './utilityTypes';
import {MessageContent} from './messages';

export type MessageContentI = PropsRequired<MessageContent, 'role'>;

export type UserContentI = {text?: string; files?: {file: File; type: MessageFileType}[]};

// if message did not overwrite, create a new message
export interface Overwrite {
  status?: boolean;
}
