import {MessageContentI} from './messagesInternal';

export type BrowserStorageItem = {
  messages: MessageContentI[];
  inputText?: string;
  scrollHeight?: number;
};

export type BrowserStorageConfig = {
  key?: string;
  maxMessages?: number;
  clear?: () => void;
  inputText?: boolean;
  scrollHeight?: boolean;
};

export type BrowserStorage = true | BrowserStorageConfig;
