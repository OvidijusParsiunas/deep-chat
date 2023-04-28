import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {MessageFile} from '../../../types/messageFile';
import {Browser} from '../../../utils/browser/browser';
import {MessageStyles} from '../../../types/messages';
import {FileMessageUtils} from './fileMessageUtils';
import {Messages} from './messages';

export class FileMessages {
  private static createImage(imageData: MessageFile, isAI: boolean, messageStyles?: MessageStyles) {
    const data = (imageData.url || imageData.base64) as string;
    const imageElement = new Image();
    imageElement.src = data;
    return FileMessageUtils.processContent(imageElement, isAI, imageData.url, messageStyles);
  }

  public static addNewImageMessage(messages: Messages, imageData: MessageFile, isAI: boolean, isInitial = false) {
    const {outerContainer, bubbleElement: imageContainer} = messages.createNewMessageElement('', isAI);
    const image = FileMessages.createImage(imageData, isAI, messages.messageStyles);
    imageContainer.appendChild(image);
    imageContainer.classList.add('image-message');
    messages.elementRef.appendChild(outerContainer);
    // TO-DO - not sure if this scrolls down properly when the image is still being rendered
    FileMessageUtils.updateMessages(messages, imageData, isInitial);
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
    const {outerContainer, bubbleElement: audioContainer} = messages.createNewMessageElement('', isAI);
    const audioElement = FileMessages.createAudioElement(audioData);
    audioContainer.appendChild(audioElement);
    audioContainer.classList.add('audio-message');
    messages.elementRef.appendChild(outerContainer);
    FileMessageUtils.updateMessages(messages, audioData, isInitial);
  }

  private static createAnyFile(imageData: MessageFile, isAI: boolean, messageStyles?: MessageStyles) {
    const contents = document.createElement('div');
    contents.classList.add('any-file-message-contents');
    const svgContainer = document.createElement('div');
    svgContainer.classList.add('any-file-message-icon-container');
    const svgIconElement = SVGIconUtils.createSVGElement(FILE_ICON_STRING);
    svgIconElement.classList.add('any-file-message-icon');
    svgContainer.appendChild(svgIconElement);
    const fileNameElement = document.createElement('div');
    fileNameElement.classList.add('any-file-message-text');
    fileNameElement.textContent = imageData.name || 'file';
    contents.appendChild(svgContainer);
    contents.appendChild(fileNameElement);
    return FileMessageUtils.processContent(contents, isAI, imageData.url, messageStyles);
  }

  public static addNewAnyFileMessage(messages: Messages, data: MessageFile, isAI: boolean, isInitial = false) {
    const {outerContainer, bubbleElement: fileContainer} = messages.createNewMessageElement('', isAI);
    const anyFile = FileMessages.createAnyFile(data, isAI, messages.messageStyles);
    fileContainer.classList.add('any-file-message-bubble');
    fileContainer.appendChild(anyFile);
    messages.elementRef.appendChild(outerContainer);
    FileMessageUtils.updateMessages(messages, data, isInitial);
  }
}
