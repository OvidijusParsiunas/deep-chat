import {BrowserStorage as BrowserStorageT} from '../../../../types/browserStorage';
import {MessageContentI} from '../../../../types/messagesInternal';

export class BrowserStorage {
  private readonly storageKey: string = 'deep-chat-storage';
  private readonly maxMessages: number = 1000;

  constructor(config: BrowserStorageT) {
    if (typeof config === 'object') {
      if (config.key) this.storageKey = config.key;
      if (config.maxMessages) this.maxMessages = config.maxMessages;
      config.clear = this.clear.bind(this);
    }
  }

  public get() {
    const item = localStorage.getItem(this.storageKey);
    if (!item) return [];
    return JSON.parse(item);
  }

  public addMessages(messages: MessageContentI[]) {
    let startIndex = messages.length - this.maxMessages;
    if (startIndex < 0) startIndex = 0;
    const processedMessages = messages.slice(startIndex, messages.length);
    localStorage.setItem(this.storageKey, JSON.stringify(processedMessages));
  }

  public clear() {
    localStorage.removeItem(this.storageKey);
  }
}
