import {MessageFile, MessageFiles} from '../../../types/messageFile';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FileMessageUtils} from './utils/fileMessageUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {Browser} from '../../../utils/browser/browser';
import {MessageStyles} from '../../../types/messages';
import {MessageUtils} from './utils/messageUtils';
import {MessagesBase} from './messagesBase';

export class FileMessages {
  private static readonly IMAGE_BUBBLE_CLASS = 'image-message';
  private static readonly AUDIO_BUBBLE_CLASS = 'audio-message';
  private static readonly ANY_FILE_BUBBLE_CLASS = 'any-file-message';

  private static createImage(imageData: MessageFile, messagesContainerEl: HTMLElement, scroll: boolean) {
    const imageElement = new Image();
    imageElement.src = imageData.src as string;
    if (scroll) FileMessageUtils.scrollDownOnImageLoad(imageElement.src, messagesContainerEl);
    return FileMessageUtils.processContent('image', imageElement, imageElement.src, imageData.name);
  }

  // WORK - image still does not scroll down when loaded
  private static createImageMessage(msg: MessagesBase, imageD: MessageFile, role: string, isTop: boolean) {
    const image = FileMessages.createImage(imageD, msg.elementRef, !isTop && !msg.focusMode);
    const elements = msg.createNewMessageElement('', role);
    elements.bubbleElement.appendChild(image);
    elements.bubbleElement.classList.add(FileMessages.IMAGE_BUBBLE_CLASS);
    return {type: 'image', elements};
  }

  private static createAudioElement(audioData: MessageFile, role: string) {
    const audioElement = document.createElement('audio');
    audioElement.src = audioData.src as string;
    audioElement.classList.add('audio-player');
    audioElement.controls = true;
    if (Browser.IS_SAFARI) {
      audioElement.classList.add('audio-player-safari');
      audioElement.classList.add(
        role === MessageUtils.USER_ROLE ? 'audio-player-safari-right' : 'audio-player-safari-left'
      );
    }
    return audioElement;
  }

  private static createNewAudioMessage(messages: MessagesBase, audioData: MessageFile, role: string, isTop: boolean) {
    const audioElement = FileMessages.createAudioElement(audioData, role);
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    elements.bubbleElement.appendChild(audioElement);
    elements.bubbleElement.classList.add(FileMessages.AUDIO_BUBBLE_CLASS);
    return {type: 'audio', elements};
  }

  private static createAnyFile(imageData: MessageFile) {
    const contents = document.createElement('div');
    contents.classList.add('any-file-message-contents');
    const svgContainer = document.createElement('div');
    svgContainer.classList.add('any-file-message-icon-container');
    const svgIconElement = SVGIconUtils.createSVGElement(FILE_ICON_STRING);
    svgIconElement.classList.add('any-file-message-icon');
    svgContainer.appendChild(svgIconElement);
    const fileNameElement = document.createElement('div');
    fileNameElement.classList.add('any-file-message-text');
    fileNameElement.textContent = imageData.name || FileMessageUtils.DEFAULT_FILE_NAME;
    contents.appendChild(svgContainer);
    contents.appendChild(fileNameElement);
    return FileMessageUtils.processContent('any', contents, imageData.src, fileNameElement.textContent);
  }

  private static createNewAnyFileMessage(messages: MessagesBase, data: MessageFile, role: string, isTop: boolean) {
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    const anyFile = FileMessages.createAnyFile(data);
    elements.bubbleElement.classList.add(FileMessages.ANY_FILE_BUBBLE_CLASS);
    elements.bubbleElement.appendChild(anyFile);
    return {type: 'file', elements};
  }

  public static createMessages(msg: MessagesBase, files: MessageFiles, role: string, isTop = false) {
    return files.map((fileData) => {
      if (fileData.ref) fileData = FileMessageUtils.removeFileRef(fileData);
      if (FileMessageUtils.isAudioFile(fileData)) {
        return FileMessages.createNewAudioMessage(msg, fileData, role, isTop);
      }
      if (FileMessageUtils.isImageFile(fileData)) {
        return FileMessages.createImageMessage(msg, fileData, role, isTop);
      }
      return FileMessages.createNewAnyFileMessage(msg, fileData, role, isTop);
    });
  }

  // no overwrite previous message logic as it is complex to track which files are to be overwritten
  public static addMessages(messages: MessagesBase, files: MessageFiles, role: string, isTop: boolean) {
    const typeToElements = FileMessages.createMessages(messages, files, role, isTop);
    typeToElements.forEach(({type, elements}) => {
      FileMessageUtils.addMessage(messages, elements, type as keyof MessageStyles, role, isTop);
    });
  }
}
