import {MessageElements, Messages} from '../messages';
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

  public static addLoadHistoryMessage(messages: Messages, isInitial = true) {
    const messageElements = messages.createMessageElements('', MessageUtils.AI_ROLE);
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add(LoadingHistory.CLASS);
    const loadingRingElement = LoadingHistory.generateLoadingRingElement();
    bubbleElement.appendChild(loadingRingElement);
    const viewClass = isInitial ? LoadingHistory.FULL_VIEW_CLASS : LoadingHistory.SMALL_CLASS;
    messageElements.outerContainer.classList.add(viewClass);
    messages.elementRef.prepend(outerContainer);
    return messageElements;
  }

  public static changeFullViewToSmall(messageElements?: MessageElements) {
    messageElements?.outerContainer.classList.replace(LoadingHistory.FULL_VIEW_CLASS, LoadingHistory.SMALL_CLASS);
  }
}
