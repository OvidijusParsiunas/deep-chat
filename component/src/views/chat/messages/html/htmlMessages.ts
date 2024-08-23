import {Overwrite} from '../../../../types/messagesInternal';
import {Legacy} from '../../../../utils/legacy/legacy';
import {MessageUtils} from '../messageUtils';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {HTMLUtils} from './htmlUtils';

export class HTMLMessages {
  private static addElement(messages: MessagesBase, outerElement: HTMLElement) {
    messages.elementRef.appendChild(outerElement);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  public static createElements(messages: MessagesBase, html: string, role: string, isTop: boolean) {
    const messageElements = messages.createMessageElementsOnOrientation('', role, isTop);
    messageElements.bubbleElement.classList.add('html-message');
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  private static overwrite(messages: MessagesBase, html: string, role: string, messagesEls: MessageElements[]) {
    const {messages: aMessages} = messages;
    const overwrittenElements = MessageUtils.overwriteMessage(aMessages, messagesEls, html, role, 'html', 'html-message');
    if (overwrittenElements) {
      overwrittenElements.bubbleElement.innerHTML = html;
      HTMLUtils.apply(messages, overwrittenElements.outerContainer);
      Legacy.flagHTMLUpdateClass(overwrittenElements.bubbleElement);
    }
    return overwrittenElements;
  }

  // prettier-ignore
  public static add(
      messages: MessagesBase, html: string, role: string,
      messagesEls: MessageElements[], overwrite?: Overwrite, isTop = false) {
    if (overwrite?.status) {
      const overwrittenElements = this.overwrite(messages, html, role, messagesEls);
      if (overwrittenElements) return overwrittenElements;
      overwrite.status = false;
    }
    const messageElements = HTMLMessages.createElements(messages, html, role, isTop);
    MessageUtils.fillEmptyMessageElement(messageElements.bubbleElement, html);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    Legacy.flagHTMLUpdateClass(messageElements.bubbleElement);
    messages.applyCustomStyles(messageElements, role, false, messages.messageStyles?.html);
    if (!isTop) HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}
