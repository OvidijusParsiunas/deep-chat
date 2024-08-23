import {HistoryMessage, LoadHistory} from '../../../../types/history';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {MessageContent} from '../../../../types/messages';
import {ServiceIO} from '../../../../services/serviceIO';
import {Legacy} from '../../../../utils/legacy/legacy';
import {LoadingHistory} from './loadingHistory';
import {DeepChat} from '../../../../deepChat';
import {Messages} from '../messages';

export class History {
  private readonly _messages: Messages;
  public static readonly FAILED_ERROR_MESSAGE = 'Failed to load history';
  private _isLoading = false;
  private _isPaginationComplete = false;
  private _index = 0;

  constructor(deepChat: DeepChat, messages: Messages, serviceIO: ServiceIO) {
    this._messages = messages;
    if (serviceIO.fetchHistory) this.fetchHistory(serviceIO.fetchHistory); // direct service
    if (deepChat.loadHistory) this.setupLoadHistoryOnScroll(deepChat.loadHistory); // custom service
    this.setupInitialHistory(deepChat);
  }

  private async fetchHistory(ioFetchHistory: Required<ServiceIO>['fetchHistory']) {
    const loadingElements = LoadingHistory.addMessage(this._messages);
    const history = await ioFetchHistory();
    this._messages.removeMessage(loadingElements);
    history.forEach((message) => this._messages.addAnyMessage(message, true));
    // https://github.com/OvidijusParsiunas/deep-chat/issues/84
    setTimeout(() => ElementUtils.scrollToBottom(this._messages.elementRef), 0);
  }

  private processLoadedHistory(historyMessages: HistoryMessage[]) {
    const firstMessageEl = this._messages.messageElementRefs[0]?.outerContainer;
    const currentScrollTop = this._messages.elementRef.scrollTop;
    historyMessages
      ?.reverse()
      .map((message) => {
        if (message) {
          const messageContent = this._messages.addAnyMessage({...message, sendUpdate: true}, true, true);
          if (messageContent) this._messages.messages.unshift(messageContent);
          return messageContent;
        } else {
          this._isPaginationComplete = true;
        }
      })
      .filter((message) => !!message)
      .reverse()
      .forEach((message) => this._messages.sendClientUpdate(message as MessageContentI, true));
    if (firstMessageEl) this._messages.elementRef.scrollTop = currentScrollTop + firstMessageEl.offsetTop;
  }

  private async setupLoadHistoryOnScroll(loadHistory: LoadHistory) {
    this._messages.elementRef.onscroll = async () => {
      if (!this._isLoading && !this._isPaginationComplete && this._messages.elementRef.scrollTop === 0) {
        this._isLoading = true;
        const loadingElements = LoadingHistory.addMessage(this._messages, false);
        try {
          const messages = await loadHistory(this._index++);
          this._messages.removeMessage(loadingElements);
          this.processLoadedHistory(messages);
          this._isLoading = false;
        } catch (e) {
          this._messages.removeMessage(loadingElements);
          this._isPaginationComplete = true;
          this._messages.addNewErrorMessage('service', History.FAILED_ERROR_MESSAGE, true);
          console.error(e);
        }
      }
    };
  }

  private populateInitialHistory(history: MessageContent[]) {
    history.forEach((message) => {
      Legacy.processHistoryFile(message);
      this._messages.addNewMessage(message, true);
    });
  }

  private async loadInitialHistory(loadHistory: LoadHistory) {
    this._isLoading = true;
    const loadingElements = LoadingHistory.addMessage(this._messages);
    try {
      const messages = await loadHistory(this._index++);
      const scrollTop = this._messages.elementRef.scrollTop;
      this._messages.removeMessage(loadingElements);
      this._isPaginationComplete = !!messages.find((message) => !message);
      const messageContent = messages.filter((message) => !!message);
      this.processLoadedHistory(messageContent as MessageContent[]);
      // force scroll to bottom if user has not scrolled anywhere themselves, otherwise keep at current location
      if (scrollTop === 0) {
        // https://github.com/OvidijusParsiunas/deep-chat/issues/84
        setTimeout(() => ElementUtils.scrollToBottom(this._messages.elementRef), 0);
      }
    } catch (e) {
      this._messages.removeMessage(loadingElements);
      this._isPaginationComplete = true;
      this._messages.addNewErrorMessage('service', History.FAILED_ERROR_MESSAGE, true);
      console.error(e);
    }
    this._isLoading = false;
  }

  private async setupInitialHistory(deepChat: DeepChat) {
    if (deepChat.loadHistory) {
      this.loadInitialHistory(deepChat.loadHistory);
    }
    const history = deepChat.history || Legacy.processHistory(deepChat);
    if (history) {
      this.populateInitialHistory(history);
      this._index += 1;
    }
  }

  public static addErrorPrefix(io: ServiceIO) {
    io.permittedErrorPrefixes ??= [];
    io.permittedErrorPrefixes.push(History.FAILED_ERROR_MESSAGE);
  }
}
