import {BrowserStorageItem, BrowserStorageConfig} from '../../../../types/browserStorage';
import {MessageContentI} from '../../../../types/messagesInternal';
import {Legacy} from '../../../../utils/legacy/legacy';

export class BrowserStorage {
  private readonly storageKey: string = 'deep-chat-storage';
  private readonly maxMessages: number = 1000;
  readonly trackInputText: boolean = false;
  readonly trackScrollHeight: boolean = false;

  constructor(config: BrowserStorageConfig | true) {
    if (typeof config === 'object') {
      if (config.key) this.storageKey = config.key;
      if (config.maxMessages) this.maxMessages = config.maxMessages;
      if (config.inputText !== undefined) this.trackInputText = config.inputText;
      if (config.scrollHeight !== undefined) this.trackScrollHeight = config.scrollHeight;
      config.clear = this.clear.bind(this);
      Legacy.processBrowserStorage(this);
    }
  }

  public get(): BrowserStorageItem {
    const item = localStorage.getItem(this.storageKey);
    if (!item) return {messages: []};
    return JSON.parse(item);
  }

  private set(messages: MessageContentI[], inputText?: string, scrollHeight?: number) {
    const item: BrowserStorageItem = {messages, inputText, scrollHeight};
    localStorage.setItem(this.storageKey, JSON.stringify(item));
  }

  public addMessages(messages: MessageContentI[]) {
    let startIndex = messages.length - this.maxMessages;
    if (startIndex < 0) startIndex = 0;
    const processedMessages = messages.slice(startIndex, messages.length);
    const item = (this.trackInputText || this.trackScrollHeight) ? localStorage.getItem(this.storageKey) : undefined;
    const parsedItem = item ? JSON.parse(item) : undefined;
    this.set(
      processedMessages,
      this.trackInputText ? parsedItem?.inputText : undefined,
      this.trackScrollHeight ? parsedItem?.scrollHeight : undefined
    );
  }

  public addInputText(inputText: string) {
    if (!this.trackInputText) return;
    const item = localStorage.getItem(this.storageKey);
    const parsedItem = item ? JSON.parse(item) : undefined;
    this.set(
      parsedItem?.messages || [],
      inputText,
      this.trackScrollHeight ? parsedItem?.scrollHeight : undefined
    );
  }

  public addScrollHeight(scrollHeight: number) {
    if (!this.trackScrollHeight) return;
    const item = localStorage.getItem(this.storageKey);
    const parsedItem = item ? JSON.parse(item) : undefined;
    this.set(
      parsedItem?.messages || [],
      this.trackInputText ? parsedItem?.inputText : undefined,
      scrollHeight
    );
  }

  public clear() {
    localStorage.removeItem(this.storageKey);
  }
}
