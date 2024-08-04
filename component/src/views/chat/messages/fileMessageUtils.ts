import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {MessageContent, MessageStyles} from '../../../types/messages';
import {MessagesBase} from './messagesBase';
import {MessageElements} from './messages';

export class FileMessageUtils {
  public static readonly DEFAULT_FILE_NAME = 'file';

  // prettier-ignore
  public static addMessage(
      messages: MessagesBase, elements: MessageElements, styles: keyof MessageStyles, role: string, isTop: boolean) {
    if (styles === 'loading') return;
    messages.applyCustomStyles(elements, role, true, messages.messageStyles?.[styles]);
    if (!isTop) {
      messages.elementRef.appendChild(elements.outerContainer);
      messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
    }
  }

  private static wrapInLink(element: HTMLElement, url: string, name?: string) {
    const linkWrapperElement = document.createElement('a');
    linkWrapperElement.href = url;
    linkWrapperElement.download = name || FileMessageUtils.DEFAULT_FILE_NAME;
    linkWrapperElement.target = '_blank';
    linkWrapperElement.appendChild(element);
    return linkWrapperElement;
  }

  private static isNonLinkableDataUrl(type: MessageFileType, url: string) {
    // if not a data url (http url) or image
    if (!url.startsWith('data') || type === 'image') return false;
    // not linking javascript as it can be a potential security vulnerability
    return (
      (type === 'any' && url.startsWith('data:text/javascript')) ||
      (!url.startsWith('data:image') && !url.startsWith('data:application'))
    );
  }

  public static processContent(type: MessageFileType, contentEl: HTMLElement, url?: string, name?: string) {
    if (!url || FileMessageUtils.isNonLinkableDataUrl(type, url)) return contentEl;
    return FileMessageUtils.wrapInLink(contentEl, url, name);
  }

  private static waitToLoadThenScroll(messagesContainerEl: HTMLElement) {
    setTimeout(() => {
      messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
    }, 60); // this timeout is used to allow the new image element dimensions to be rendered
  }
  public static scrollDownOnImageLoad(url: string, messagesContainerEl: HTMLElement) {
    if (url.startsWith('data')) {
      FileMessageUtils.waitToLoadThenScroll(messagesContainerEl);
    } else {
      // this is used to prevent an issue where we immediately scroll down before the image meta data has been
      // downloaded which is used to create the image element dimensions (before the image data is loaded)
      // we cannot use the .onload event handler as it is only triggered when the image is fully rendered on
      // the screen and not when it first appears - hence not appropriate for slow images
      try {
        // no-cors is an attempt to prevent a typical 'No 'Access-Control-Allow-Origin' header' error
        // being logged in the console
        fetch(url, {mode: 'no-cors'})
          .catch(() => {})
          .finally(() => {
            FileMessageUtils.waitToLoadThenScroll(messagesContainerEl);
          });
      } catch (err) {
        messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
      }
    }
  }

  // The strategy is to emit the actual file reference in the `onMessage` event for the user to inspect it
  // But it is not actually used by anything in the chat, hence it is removed when adding a message

  // after the body has been stringified and parsed - the file reference will disappear, hence this readds it
  public static reAddFileRefToObject(message: MessageContent, body: {message: MessageContent; isHistory: boolean}) {
    message.files?.forEach((file, index) => {
      if (file.ref && body.message.files?.[index]) body.message.files[index].ref = file.ref;
    });
  }

  // the chat does not use the actual file
  public static removeFileRef(messageFile: MessageFile): Omit<MessageFile, 'file'> {
    const newMessageFileObj = {...messageFile};
    delete newMessageFileObj.ref;
    return newMessageFileObj;
  }

  public static isAudioFile(fileData: MessageFile) {
    const audioRegex = /\.(mp3|ogg|wav|aac|webm|4a)$/i;
    const {type, src} = fileData;
    return type === 'audio' || src?.startsWith('data:audio') || (src && audioRegex.test(src));
  }

  public static isImageFile(fileData: MessageFile) {
    const {type, src} = fileData;
    return type === 'image' || src?.startsWith('data:image') || (src && FileMessageUtils.isImageFileExtension(src));
  }

  public static isImageFileExtension(fileName: string) {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
    return imageRegex.test(fileName);
  }
}
