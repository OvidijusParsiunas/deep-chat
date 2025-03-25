import {Overwrite} from '../../../../types/messagesInternal';
import {Legacy} from '../../../../utils/legacy/legacy';
import {MessageUtils} from '../utils/messageUtils';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {HTMLUtils} from './htmlUtils';

export class HTMLMessages {
  public static readonly HTML_BUBBLE_CLASS = 'html-message';

  private static addElement(messages: MessagesBase, outerElement: HTMLElement) {
    messages.appendOuterContainerElemet(outerElement);
    if (!messages.focusMode) messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
  }

  public static createElements(messages: MessagesBase, html: string, role: string, isTop: boolean, loading = false) {
    const messageElements = messages.createMessageElementsOnOrientation('', role, isTop, loading);
    messageElements.bubbleElement.classList.add(HTMLMessages.HTML_BUBBLE_CLASS);
    messageElements.bubbleElement.innerHTML = html;
    return messageElements;
  }

  public static overwriteElements(messages: MessagesBase, html: string, overwrittenElements: MessageElements) {
    overwrittenElements.bubbleElement.innerHTML = html;
    HTMLUtils.apply(messages, overwrittenElements.outerContainer);
    Legacy.flagHTMLUpdateClass(overwrittenElements.bubbleElement);
  }

  // prettier-ignore
  private static overwrite(messages: MessagesBase, html: string, role: string, messageElementRefs: MessageElements[]) {
    const {messageToElements: msgToEls} = messages;
    const overwrittenElements = MessageUtils.overwriteMessage(
      msgToEls, messageElementRefs, html, role, 'html', HTMLMessages.HTML_BUBBLE_CLASS);
    if (overwrittenElements) {
      HTMLMessages.overwriteElements(messages, html, overwrittenElements);
    }
    return overwrittenElements;
  }

  public static create(messages: MessagesBase, html: string, role: string, isTop = false) {
    const messageElements = HTMLMessages.createElements(messages, html, role, isTop);
    MessageUtils.fillEmptyMessageElement(messageElements.bubbleElement, html);
    HTMLUtils.apply(messages, messageElements.outerContainer);
    Legacy.flagHTMLUpdateClass(messageElements.bubbleElement);
    messages.applyCustomStyles(messageElements, role, false, messages.messageStyles?.html);
    return messageElements;
  }

  public static add(messages: MessagesBase, html: string, role: string, overwrite?: Overwrite, isTop = false) {
    if (overwrite?.status) {
      const overwrittenElements = this.overwrite(messages, html, role, messages.messageElementRefs);
      if (overwrittenElements) return overwrittenElements;
      overwrite.status = false;
    }
    // if top history, temporary and there already are element refs, do not add message
    if (isTop && messages.messageElementRefs.length > 0 && HTMLUtils.isTemporaryBasedOnHTML(html)) {
      return;
    }
    const messageElements = HTMLMessages.create(messages, html, role, isTop);
    if (!isTop) HTMLMessages.addElement(messages, messageElements.outerContainer);
    return messageElements;
  }
}
