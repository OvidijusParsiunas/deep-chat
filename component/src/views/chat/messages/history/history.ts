import {HistoryMessage, LoadHistory} from '../../../../types/history';
import {ElementUtils} from '../../../../utils/element/elementUtils';
import {MessageContentI} from '../../../../types/messagesInternal';
import {MessageContent} from '../../../../types/messages';
import {ServiceIO} from '../../../../services/serviceIO';
import {Legacy} from '../../../../utils/legacy/legacy';
import {MessageElements, Messages} from '../messages';
import {MessageUtils} from '../utils/messageUtils';
import {LoadingHistory} from './loadingHistory';
import {DeepChat} from '../../../../deepChat';
import {MessagesBase} from '../messagesBase';

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
    History.displayIntroMessages(this._messages.messageElementRefs);
    history.forEach((message) => this._messages.addAnyMessage(message, true));
    // https://github.com/OvidijusParsiunas/deep-chat/issues/84
    setTimeout(() => ElementUtils.scrollToBottom(this._messages.elementRef), 0);
  }

  private processLoadedHistory(historyMessages: HistoryMessage[]) {
    const {messageElementRefs, messageToElements, elementRef} = this._messages;
    const preLoadFirstMessageEl = messageElementRefs.find(
      (messageElRefs) => !messageElRefs.outerContainer.classList.contains(MessagesBase.INTRO_CLASS)
    )?.outerContainer;
    const currentScrollTop = elementRef.scrollTop;
    historyMessages
      ?.reverse()
      .map((message) => {
        const messageContent = this._messages.addAnyMessage({...message, sendUpdate: true}, true, true);
        if (messageContent) {
          const messageBody = MessageUtils.generateMessageBody(messageContent, messageElementRefs, true);
          messageToElements.unshift([messageContent, messageBody]);
        }
        return messageContent;
      })
      .filter((message) => !!message)
      .reverse()
      .forEach((message) => this._messages.sendClientUpdate(message as MessageContentI, true));
    if (preLoadFirstMessageEl) elementRef.scrollTop = currentScrollTop + preLoadFirstMessageEl.offsetTop - 40;
  }

  private populateMessages(loadingElements: MessageElements, messages: HistoryMessage[]) {
    this._messages.removeMessage(loadingElements);
    this._isPaginationComplete = messages.findIndex((message) => !message) < 0;
    const messageContent = messages.filter((message) => !!message);
    this.processLoadedHistory(messageContent);
    const {messageElementRefs, avatar, name} = this._messages;
    MessageUtils.resetAllRoleElements(messageElementRefs, avatar, name);
  }

  private async setupLoadHistoryOnScroll(loadHistory: LoadHistory) {
    this._messages.elementRef.onscroll = async () => {
      if (!this._isLoading && !this._isPaginationComplete && this._messages.elementRef.scrollTop === 0) {
        this._isLoading = true;
        const loadingElements = LoadingHistory.addMessage(this._messages, false);
        try {
          const messages = await loadHistory(this._index++);
          this.populateMessages(loadingElements, messages);
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
      this._messages.addAnyMessage(message, true);
    });
  }

  private async loadInitialHistory(loadHistory: LoadHistory) {
    this._isLoading = true;
    const loadingElements = LoadingHistory.addMessage(this._messages);
    try {
      const messages = await loadHistory(this._index++);
      const scrollTop = this._messages.elementRef.scrollTop;
      this.populateMessages(loadingElements, messages);
      // force scroll to bottom if user has not scrolled anywhere themselves (at start), otherwise keep at current location
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
    History.displayIntroMessages(this._messages.messageElementRefs);
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

  private static displayIntroMessages(messageElementRefs: MessageElements[]) {
    for (let i = 0; i < messageElementRefs.length; i += 1) {
      const messageEls = messageElementRefs[0];
      if (messageEls.outerContainer.classList.contains(MessagesBase.INTRO_CLASS)) {
        messageEls.outerContainer.style.display = '';
      } else {
        break;
      }
    }
  }
}
