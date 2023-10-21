import {MessageFile, MessageFiles} from '../../../types/messageFile';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {Browser} from '../../../utils/browser/browser';
import {FileMessageUtils} from './fileMessageUtils';
import {Messages} from './messages';

export class FileMessages {
  private static createImage(imageData: MessageFile, messagesContainerEl: HTMLElement) {
    const imageElement = new Image();
    imageElement.src = imageData.src as string;
    FileMessageUtils.scrollDownOnImageLoad(imageElement.src, messagesContainerEl);
    return FileMessageUtils.processContent(imageElement, imageElement.src);
  }

  // WORK - should base64 images be clickable?
  // WORK - image still does not scroll down when loaded
  private static async addNewImageMessage(messages: Messages, imageData: MessageFile, isAI: boolean) {
    const image = FileMessages.createImage(imageData, messages.elementRef);
    const elements = messages.createNewMessageElement('', isAI);
    elements.bubbleElement.appendChild(image);
    elements.bubbleElement.classList.add('image-message');
    FileMessageUtils.addMessage(messages, elements, 'image', isAI);
  }

  private static createAudioElement(audioData: MessageFile, isAI: boolean) {
    const audioElement = document.createElement('audio');
    audioElement.src = audioData.src as string;
    audioElement.classList.add('audio-player');
    audioElement.controls = true;
    if (Browser.IS_SAFARI) {
      audioElement.classList.add('audio-player-safari');
      audioElement.classList.add(isAI ? 'audio-player-safari-left' : 'audio-player-safari-right');
    }
    return audioElement;
  }

  private static addNewAudioMessage(messages: Messages, audioData: MessageFile, isAI: boolean) {
    const audioElement = FileMessages.createAudioElement(audioData, isAI);
    const elements = messages.createNewMessageElement('', isAI);
    elements.bubbleElement.appendChild(audioElement);
    elements.bubbleElement.classList.add('audio-message');
    FileMessageUtils.addMessage(messages, elements, 'audio', isAI);
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
    return FileMessageUtils.processContent(contents, imageData.src);
  }

  private static addNewAnyFileMessage(messages: Messages, data: MessageFile, isAI: boolean) {
    const elements = messages.createNewMessageElement('', isAI);
    const anyFile = FileMessages.createAnyFile(data);
    elements.bubbleElement.classList.add('any-file-message-bubble');
    elements.bubbleElement.appendChild(anyFile);
    FileMessageUtils.addMessage(messages, elements, 'file', isAI);
  }

  public static addMessages(messages: Messages, files: MessageFiles, isAI: boolean) {
    files.forEach((fileData) => {
      if (fileData.type === 'audio' || fileData.src?.startsWith('data:audio')) {
        FileMessages.addNewAudioMessage(messages, fileData, isAI);
      } else if (fileData.type === 'image' || fileData.src?.startsWith('data:image')) {
        FileMessages.addNewImageMessage(messages, fileData, isAI);
      } else {
        // WORK - should there be a check to see if it is image
        FileMessages.addNewAnyFileMessage(messages, fileData, isAI);
      }
    });
  }
}
