import {MessageContentI} from '../../../../types/messagesInternal';
import {HTMLDeepChatElements} from './htmlDeepChatElements';
import {MessageElements, Messages} from '../messages';
import {MessageUtils} from '../messageUtils';
import {HTMLUtils} from './htmlUtils';

export class HTMLMessages {
  private static addElement(messages: Messages, outerElement: HTMLElement) {
    messages.elementRef.appendChild(outerElement);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  private static createElements(messages: Messages, html: string, role: string) {
    const messageElements = messages.createNewMessageElement('', role);
    messageElements.bubbleElement.classList.add('html-message');
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  // test when last element contains no html but text, should text be removed?
  // prettier-ignore
  private static updateLastAIMessage(messages: MessageContentI[], html: string, messagesElements: MessageElements[]) {
    const lastElems = MessageUtils.getLastElementsByClass(
      messagesElements, ['ai-message-text', 'html-message'], ['loading-message-text']);
    if (!lastElems) return false;
    if (lastElems) lastElems.bubbleElement.innerHTML = html;
    const lastMessage = MessageUtils.getLastMessage(messages, true, 'html');
    if (lastMessage) lastMessage.html = html;
    return true;
  }

  public static add(messages: Messages, html: string, role: string, messagesElements: MessageElements[]) {
    if (HTMLDeepChatElements.isUpdateMessage(html)) {
      const wasUpdated = HTMLMessages.updateLastAIMessage(messages.messages, html, messagesElements);
      if (wasUpdated) return undefined;
    }
    const messageElements = HTMLMessages.createElements(messages, html, role);
    if (html.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    messages.applyCustomStyles(messageElements, role, false, messages.messageStyles?.html);
    HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}
