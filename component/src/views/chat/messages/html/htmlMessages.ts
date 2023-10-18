import {HTMLUtils} from './htmlUtils';
import {Messages} from '../messages';

export class HTMLMessages {
  private static addElement(messages: Messages, outerElement: HTMLElement) {
    messages.elementRef.appendChild(outerElement);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  private static createElements(messages: Messages, html: string, isAI: boolean) {
    const messageElements = messages.createNewMessageElement('', isAI);
    messageElements.bubbleElement.classList.add('html-message');
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  public static addNewHTMLMessage(messages: Messages, html: string, isAI: boolean) {
    const messageElements = HTMLMessages.createElements(messages, html, isAI);
    if (html.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    messages.applyCustomStyles(messageElements, isAI, false, messages.messageStyles?.html);
    HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}
