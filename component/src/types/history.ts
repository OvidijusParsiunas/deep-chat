import {MessageContent} from './messages';

export type HistoryMessage = MessageContent | false;

export type LoadHistory = (index: number) => HistoryMessage[] | Promise<HistoryMessage[]>;
