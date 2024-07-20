import {MessageFile, MessageFiles} from '../../../types/messageFile';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {Browser} from '../../../utils/browser/browser';
import {FileMessageUtils} from './fileMessageUtils';
import {MessageUtils} from './messageUtils';
import {Messages} from './messages';

export class FileMessages {
  private static createImage(imageData: MessageFile, messagesContainerEl: HTMLElement, isTop: boolean) {
    const imageElement = new Image();
    imageElement.src = imageData.src as string;
    if (!isTop) FileMessageUtils.scrollDownOnImageLoad(imageElement.src, messagesContainerEl);
    return FileMessageUtils.processContent('image', imageElement, imageElement.src, imageData.name);
  }

  // WORK - image still does not scroll down when loaded
  private static async addNewImageMessage(messages: Messages, imageData: MessageFile, role: string, isTop: boolean) {
    const image = FileMessages.createImage(imageData, messages.elementRef, isTop);
    const elements = messages.createNewMessageElement('', role);
    elements.bubbleElement.appendChild(image);
    elements.bubbleElement.classList.add('image-message');
    FileMessageUtils.addMessage(messages, elements, 'image', role, isTop);
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

  private static addNewAudioMessage(messages: Messages, audioData: MessageFile, role: string, isTop: boolean) {
    const audioElement = FileMessages.createAudioElement(audioData, role);
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    elements.bubbleElement.appendChild(audioElement);
    elements.bubbleElement.classList.add('audio-message');
    FileMessageUtils.addMessage(messages, elements, 'audio', role, isTop);
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

  private static addNewAnyFileMessage(messages: Messages, data: MessageFile, role: string, isTop: boolean) {
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    const anyFile = FileMessages.createAnyFile(data);
    elements.bubbleElement.classList.add('any-file-message-bubble');
    elements.bubbleElement.appendChild(anyFile);
    FileMessageUtils.addMessage(messages, elements, 'file', role, isTop);
  }

  // no overwrite previous message logic as it is complex to track which files are to be overwritten
  public static addMessages(messages: Messages, files: MessageFiles, role: string, isTop: boolean) {
    files.forEach((fileData) => {
      if (fileData.ref) fileData = FileMessageUtils.removeFileRef(fileData);
      if (FileMessageUtils.isAudioFile(fileData)) {
        FileMessages.addNewAudioMessage(messages, fileData, role, isTop);
      } else if (FileMessageUtils.isImageFile(fileData)) {
        FileMessages.addNewImageMessage(messages, fileData, role, isTop);
      } else {
        FileMessages.addNewAnyFileMessage(messages, fileData, role, isTop);
      }
    });
  }
}
