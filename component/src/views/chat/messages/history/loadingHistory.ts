import {LoadingStyle} from '../../../../utils/loading/loadingStyle';
import {MessageElementsStyles} from '../../../../types/messages';
import {MessageElements, Messages} from '../messages';
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

  private static apply(messages: MessagesBase, messageElements: MessageElements, styles: MessageElementsStyles) {
    if (styles.bubble) {
      LoadingStyle.setRing(messageElements.bubbleElement, styles.bubble);
      styles = JSON.parse(JSON.stringify(styles)) as MessageElementsStyles;
      delete styles.bubble;
    }
    messages.applyCustomStyles(messageElements, 'history', false, styles);
  }

  public static addLoadHistoryMessage(messages: Messages, isInitial = true) {
    const messageElements = messages.createMessageElements('', MessageUtils.AI_ROLE);
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add(LoadingHistory.CLASS);
    const loadingRingElement = LoadingHistory.generateLoadingRingElement();
    bubbleElement.appendChild(loadingRingElement);
    const viewClass = isInitial ? LoadingHistory.FULL_VIEW_CLASS : LoadingHistory.SMALL_CLASS;
    messageElements.outerContainer.classList.add(viewClass);
    const styles = isInitial
      ? messages.messageStyles?.loading?.history?.full?.styles
      : messages.messageStyles?.loading?.history?.small?.styles;
    if (styles) LoadingHistory.apply(messages, messageElements, styles);
    messages.elementRef.prepend(outerContainer);
    return messageElements;
  }

  public static changeFullViewToSmall(messages: MessagesBase, messageElements?: MessageElements) {
    if (messageElements?.outerContainer.classList.contains(LoadingHistory.FULL_VIEW_CLASS)) {
      messageElements.outerContainer.classList.replace(LoadingHistory.FULL_VIEW_CLASS, LoadingHistory.SMALL_CLASS);
      const styles = messages.messageStyles?.loading?.history?.small?.styles;
      if (styles) LoadingHistory.apply(messages, messageElements, styles);
    }
  }
}
