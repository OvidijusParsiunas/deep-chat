import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {MessageFile} from '../../../types/messageFile';
import {Browser} from '../../../utils/browser/browser';
import {FileMessageUtils} from './fileMessageUtils';
import {Messages} from './messages';

export class FileMessages {
  private static createImage(imageData: MessageFile, messagesContainerEl: HTMLElement) {
    const imageElement = new Image();
    imageElement.src = (imageData.url || imageData.base64) as string;
    if (imageData.url) FileMessageUtils.scrollDownWhenMetaDataLoaded(imageData.url, messagesContainerEl);
    return FileMessageUtils.processContent(imageElement, imageData.url);
  }

  public static async addNewImageMessage(messages: Messages, imageData: MessageFile, isAI: boolean, isInitial = false) {
    const image = FileMessages.createImage(imageData, messages.elementRef);
    const elements = messages.createNewMessageElement('', isAI);
    elements.bubbleElement.appendChild(image);
    elements.bubbleElement.classList.add('image-message');
    messages.elementRef.appendChild(elements.outerContainer);
    FileMessageUtils.updateMessages(messages, elements, imageData, 'image', isAI, isInitial);
  }

  private static createAudioElement(audioData: MessageFile) {
    const data = (audioData.url || audioData.base64) as string;
    const audioElement = document.createElement('audio');
    audioElement.src = data;
    audioElement.classList.add('audio-player');
    audioElement.controls = true;
    if (Browser.IS_SAFARI) audioElement.classList.add('audio-player-safari');
    return audioElement;
  }

  public static addNewAudioMessage(messages: Messages, audioData: MessageFile, isAI: boolean, isInitial = false) {
    const audioElement = FileMessages.createAudioElement(audioData);
    const elements = messages.createNewMessageElement('', isAI);
    elements.bubbleElement.appendChild(audioElement);
    elements.bubbleElement.classList.add('audio-message');
    messages.elementRef.appendChild(elements.outerContainer);
    FileMessageUtils.updateMessages(messages, elements, audioData, 'audio', isAI, isInitial);
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
    return FileMessageUtils.processContent(contents, imageData.url);
  }

  public static addNewAnyFileMessage(messages: Messages, data: MessageFile, isAI: boolean, isInitial = false) {
    const elements = messages.createNewMessageElement('', isAI);
    const anyFile = FileMessages.createAnyFile(data);
    elements.bubbleElement.classList.add('any-file-message-bubble');
    elements.bubbleElement.appendChild(anyFile);
    messages.elementRef.appendChild(elements.outerContainer);
    FileMessageUtils.updateMessages(messages, elements, data, 'file', isAI, isInitial);
  }
}
