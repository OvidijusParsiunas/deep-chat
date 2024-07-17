import {MessageContent} from './messages';

export type LoadHistory = (index: number) => MessageContent[] | Promise<MessageContent[]>;
