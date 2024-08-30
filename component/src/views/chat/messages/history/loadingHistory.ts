import {LoadingStyle} from '../../../../utils/loading/loadingStyle';
import {MessageElementsStyles} from '../../../../types/messages';
import {MessageElements, Messages} from '../messages';
import {HTMLMessages} from '../html/htmlMessages';
import {MessagesBase} from '../messagesBase';
import {MessageUtils} from '../messageUtils';

export class LoadingHistory {
  public static readonly CLASS = 'loading-history-message';
  private static readonly FULL_VIEW_CLASS = 'loading-history-message-full-view';
  private static readonly SMALL_CLASS = 'loading-history-message-small';

  private static generateLoadingRingElement() {
    const loadingRingElement = document.createElement('div');
    loadingRingElement.classList.add('loading-history');
    loadingRingElement.appendChild(document.createElement('div'));
    loadingRingElement.appendChild(document.createElement('div'));
    loadingRingElement.appendChild(document.createElement('div'));
    loadingRingElement.appendChild(document.createElement('div'));
    return loadingRingElement;
  }

  private static apply(messages: MessagesBase, messageElements: MessageElements, styles?: MessageElementsStyles) {
    LoadingStyle.setRing(messageElements.bubbleElement, styles?.bubble);
    if (styles?.bubble) {
      styles = JSON.parse(JSON.stringify(styles)) as MessageElementsStyles;
      delete styles.bubble; // removing bubble styling as above uses it
    }
    messages.applyCustomStyles(messageElements, 'history', false, styles);
  }

  private static addLoadHistoryMessage(messageElements: MessageElements, messages: Messages, isInitial = true) {
    messageElements.bubbleElement.classList.add(LoadingHistory.CLASS);
    const viewClass = isInitial ? LoadingHistory.FULL_VIEW_CLASS : LoadingHistory.SMALL_CLASS;
    messageElements.outerContainer.classList.add(viewClass);
    const styles = isInitial
      ? messages.messageStyles?.loading?.history?.full?.styles
      : messages.messageStyles?.loading?.history?.small?.styles;
    LoadingHistory.apply(messages, messageElements, styles);
    messages.elementRef.prepend(messageElements.outerContainer);
  }

  public static createDefaultElements(messages: Messages) {
    const messageElements = messages.createMessageElements('', MessageUtils.AI_ROLE);
    const {bubbleElement} = messageElements;
    const loadingRingElement = LoadingHistory.generateLoadingRingElement();
    bubbleElement.appendChild(loadingRingElement);
    return messageElements;
  }

  public static addMessage(messages: Messages, isInitial = true) {
    const html = messages.messageStyles?.loading?.history?.full?.html;
    const messageElements = html
      ? HTMLMessages.createElements(messages, html, MessageUtils.AI_ROLE, true)
      : LoadingHistory.createDefaultElements(messages);
    LoadingHistory.addLoadHistoryMessage(messageElements, messages, isInitial);
    return messageElements;
  }

  public static changeFullViewToSmall(messages: MessagesBase, messageElements?: MessageElements) {
    if (messageElements?.outerContainer.classList.contains(LoadingHistory.FULL_VIEW_CLASS)) {
      messageElements.outerContainer.classList.replace(LoadingHistory.FULL_VIEW_CLASS, LoadingHistory.SMALL_CLASS);
      const styles = messages.messageStyles?.loading?.history?.small?.styles;
      if (styles) LoadingHistory.apply(messages, messageElements, styles);
      const html = messages.messageStyles?.loading?.history?.small?.html;
      if (html) messageElements.bubbleElement.innerHTML = html;
    }
  }
}
