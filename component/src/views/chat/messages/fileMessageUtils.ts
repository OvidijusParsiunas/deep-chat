import {MessageStyles, MessageSideStyles} from '../../../types/messages';
import {MessageFile} from '../../../types/messageFile';
import {MessageElements, Messages} from './messages';

export class FileMessageUtils {
  // prettier-ignore
  public static updateMessages(messages: Messages, elements: MessageElements, data: MessageFile,
      styles: keyof MessageStyles, isAI: boolean, isInitial = false) {
    messages.applyCustomStyles(elements, isAI, true, messages.messageStyles?.[styles] as MessageSideStyles);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
    const messageContent = Messages.createMessageContent(true, undefined, data);
    messages.messages.push(messageContent);
    messages.sendClientUpdate(messageContent, isInitial);
  }

  private static wrapInLink(element: HTMLElement, url: string) {
    const linkWrapperElement = document.createElement('a');
    linkWrapperElement.href = url;
    linkWrapperElement.target = '_blank';
    linkWrapperElement.appendChild(element);
    return linkWrapperElement;
  }

  public static processContent(contentEl: HTMLElement, url?: string) {
    if (!url) return contentEl;
    return FileMessageUtils.wrapInLink(contentEl, url);
  }
}
