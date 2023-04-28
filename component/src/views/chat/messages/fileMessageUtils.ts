import {MessageFile} from '../../../types/messageFile';
import {MessageStyles} from '../../../types/messages';
import {Messages} from './messages';

export class FileMessageUtils {
  public static updateMessages(messages: Messages, data: MessageFile, isInitial = false) {
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

  public static processContent(contentEl: HTMLElement, isAI: boolean, url?: string, messageStyles?: MessageStyles) {
    Object.assign(contentEl.style, messageStyles?.default?.media);
    Object.assign(contentEl.style, isAI ? messageStyles?.ai?.media : messageStyles?.user?.media);
    if (!url) return contentEl;
    return FileMessageUtils.wrapInLink(contentEl, url);
  }
}
