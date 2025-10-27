import {MessageContentI} from './messagesInternal';

export type BrowserStorageItem = {messages: MessageContentI[]; inputText?: string};

export type BrowserStorage = true | {key?: string; maxMessages?: number; clear?: () => void; inputText?: boolean};
