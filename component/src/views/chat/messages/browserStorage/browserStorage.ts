import {BrowserStorageItem, BrowserStorage as BrowserStorageT} from '../../../../types/browserStorage';
import {MessageContentI} from '../../../../types/messagesInternal';
import {Legacy} from '../../../../utils/legacy/legacy';

export class BrowserStorage {
  private readonly storageKey: string = 'deep-chat-storage';
  private readonly maxMessages: number = 1000;
  readonly trackInputText: boolean = false;

  constructor(config: BrowserStorageT) {
    if (typeof config === 'object') {
      if (config.key) this.storageKey = config.key;
      if (config.maxMessages) this.maxMessages = config.maxMessages;
      if (config.inputText !== undefined) this.trackInputText = config.inputText;
      config.clear = this.clear.bind(this);
      Legacy.processBrowserStorage(this);
    }
  }

  public get(): BrowserStorageItem {
    const item = localStorage.getItem(this.storageKey);
    if (!item) return {messages: []};
    return JSON.parse(item);
  }

  private set(messages: MessageContentI[], inputText?: string) {
    const item: BrowserStorageItem = {messages, inputText};
    localStorage.setItem(this.storageKey, JSON.stringify(item));
  }

  public addMessages(messages: MessageContentI[]) {
    let startIndex = messages.length - this.maxMessages;
    if (startIndex < 0) startIndex = 0;
    const processedMessages = messages.slice(startIndex, messages.length);
    const item = this.trackInputText ? localStorage.getItem(this.storageKey) : undefined;
    this.set(processedMessages, item ? JSON.parse(item).inputText : undefined);
  }

  public addInputText(inputText: string) {
    if (!this.trackInputText) return;
    const item = localStorage.getItem(this.storageKey);
    this.set(item ? JSON.parse(item).messages || [] : [], inputText);
  }

  public clear() {
    localStorage.removeItem(this.storageKey);
  }
}
