import {ANY, AUDIO, FILE, FILE_BUBBLE_CLASS, FILES, IMAGE} from '../../../../utils/consts/messageConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../utils/consts/htmlConstants';
import {MessageFile, MessageFileType} from '../../../../types/messageFile';
import {MessageContent, MessageStyles} from '../../../../types/messages';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';

export class FileMessageUtils {
  // prettier-ignore
  public static setElementProps(
      messages: MessagesBase, elements: MessageElements, styles: keyof MessageStyles, role: string) {
    if (styles === 'loading') return;
    messages.applyCustomStyles(elements, role, true, messages.messageStyles?.[styles]);
    elements.bubbleElement[CLASS_LIST].add(FILE_BUBBLE_CLASS);
  }

  // prettier-ignore
  public static addMessage(
      messages: MessagesBase, elements: MessageElements, styles: keyof MessageStyles, role: string, isTop: boolean) {
    FileMessageUtils.setElementProps(messages, elements, styles, role);
    if (!isTop) messages.appendOuterContainerElemet(elements.outerContainer);
  }

  private static wrapInLink(element: HTMLElement, url: string, name?: string) {
    const linkWrapperElement = CREATE_ELEMENT('a') as HTMLAnchorElement;
    linkWrapperElement.href = url;
    linkWrapperElement.download = name || FILE;
    linkWrapperElement.target = '_blank';
    linkWrapperElement.appendChild(element);
    return linkWrapperElement;
  }

  private static isNonLinkableDataUrl(type: MessageFileType, url: string) {
    // if not a data url (http url) or image
    if (!url.startsWith('data') || type === IMAGE) return false;
    // not linking javascript as it can be a potential security vulnerability
    return (
      (type === ANY && url.startsWith('data:text/javascript')) ||
      (!url.startsWith('data:image') && !url.startsWith('data:application'))
    );
  }

  public static processContent(type: MessageFileType, contentEl: HTMLElement, url?: string, name?: string) {
    if (!url || FileMessageUtils.isNonLinkableDataUrl(type, url)) return contentEl;
    return FileMessageUtils.wrapInLink(contentEl, url, name);
  }

  private static waitToLoadThenScroll(asyncScroll: () => void) {
    setTimeout(() => {
      asyncScroll();
    }, 60); // this timeout is used to allow the new image element dimensions to be rendered
  }

  public static scrollDownOnImageLoad(url: string, asyncScroll: () => void) {
    if (url.startsWith('data')) {
      FileMessageUtils.waitToLoadThenScroll(asyncScroll);
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
            FileMessageUtils.waitToLoadThenScroll(asyncScroll);
          });
      } catch (_) {
        asyncScroll();
      }
    }
  }

  // The strategy is to emit the actual file reference in the `onMessage` event for the user to inspect it
  // But it is not actually used by anything in the chat, hence it is removed when adding a message

  // after the body has been stringified and parsed - the file reference will disappear, hence this readds it
  public static reAddFileRefToObject(message: {files?: MessageFile[]}, targetMessage: MessageContent) {
    message[FILES]?.forEach((file, index) => {
      if (file.ref && targetMessage[FILES]?.[index]) targetMessage[FILES][index].ref = file.ref;
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
    return type === AUDIO || src?.startsWith('data:audio') || (src && audioRegex.test(src));
  }

  public static isImageFile(fileData: MessageFile) {
    const {type, src} = fileData;
    return type === IMAGE || src?.startsWith('data:image') || (src && FileMessageUtils.isImageFileExtension(src));
  }

  public static isImageFileExtension(fileName: string) {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
    return imageRegex.test(fileName);
  }
}
