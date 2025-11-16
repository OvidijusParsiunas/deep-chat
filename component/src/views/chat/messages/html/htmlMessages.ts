import {CLASS_LIST} from '../../../../utils/consts/htmlConstants';
import {HTML} from '../../../../utils/consts/messageConstants';
import {Overwrite} from '../../../../types/messagesInternal';
import {Legacy} from '../../../../utils/legacy/legacy';
import {MessageUtils} from '../utils/messageUtils';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {HTMLUtils} from './htmlUtils';

export class HTMLMessages {
  public static readonly HTML_BUBBLE_CLASS = 'html-message';

  public static createElements(messages: MessagesBase, html: string, role: string, isTop: boolean, loading = false) {
    const messageElements = messages.createMessageElementsOnOrientation('', role, isTop, loading);
    messageElements.bubbleElement[CLASS_LIST].add(HTMLMessages.HTML_BUBBLE_CLASS);
    const {contentEl} = HTMLUtils.tryAddWrapper(messageElements.bubbleElement, html, messages._customWrappers, role);
    contentEl.innerHTML = html;
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
      msgToEls, messageElementRefs, html, role, HTML, HTMLMessages.HTML_BUBBLE_CLASS);
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
    messages.applyCustomStyles(messageElements, role, false, messages.messageStyles?.[HTML]);
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
    if (!isTop) messages.appendOuterContainerElemet(messageElements.outerContainer);
    return messageElements;
  }
}
