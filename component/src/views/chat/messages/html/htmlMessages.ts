import {HTMLDeepChatElements} from './htmlDeepChatElements';
import {HTMLUtils} from './htmlUtils';
import {Messages} from '../messages';

export class HTMLMessages {
  private static addElement(messages: Messages, outerElement: HTMLElement) {
    messages.elementRef.appendChild(outerElement);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  private static update(messages: Messages, html: string, isAI: boolean, update: boolean, isInitial = false) {
    const messageContent = Messages.createMessageContent(isAI, {html});
    if (!isInitial) messages.messages.push(messageContent);
    if (update) messages.sendClientUpdate(messageContent, isInitial);
  }

  private static createElements(messages: Messages, html: string, isAI: boolean) {
    const messageElements = messages.createNewMessageElement('', isAI);
    messageElements.bubbleElement.style.maxWidth = 'unset';
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  public static addNewHTMLMessage(messages: Messages, html: string, isAI: boolean, update: boolean, isInitial = false) {
    const messageElements = HTMLMessages.createElements(messages, html, isAI);
    if (html.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    if (!HTMLDeepChatElements.isElementTemporary(messageElements)) {
      HTMLMessages.update(messages, html, isAI, update, isInitial);
    }
    HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}
