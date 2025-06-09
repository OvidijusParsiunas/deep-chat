import {BrowserStorage as BrowserStorageT} from '../../../../types/browserStorage';
import {MessageContentI} from '../../../../types/messagesInternal';

export class BrowserStorage {
  private readonly storageKey: string = 'deep-chat-storage';

  constructor(config: BrowserStorageT) {
    if (typeof config === 'object') {
      if (config.key) this.storageKey = config.key;
      config.clear = this.clear.bind(this);
    }
  }

  public get() {
    const item = localStorage.getItem(this.storageKey);
    if (!item) return [];
    return JSON.parse(item);
  }

  public addMessages(messages: MessageContentI[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  public clear() {
    localStorage.removeItem(this.storageKey);
  }
}
