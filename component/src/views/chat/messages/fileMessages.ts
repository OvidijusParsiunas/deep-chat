import {ANY, AUDIO, FILE, IMAGE, SRC, USER} from '../../../utils/consts/messageConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../utils/consts/htmlConstants';
import {MessageFile, MessageFiles} from '../../../types/messageFile';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {FileMessageUtils} from './utils/fileMessageUtils';
import {FILE_ICON_STRING} from '../../../icons/fileIcon';
import {Browser} from '../../../utils/browser/browser';
import {MessageStyles} from '../../../types/messages';
import {MessagesBase} from './messagesBase';

export class FileMessages {
  private static readonly IMAGE_BUBBLE_CLASS = 'image-message';
  private static readonly AUDIO_BUBBLE_CLASS = 'audio-message';
  private static readonly ANY_FILE_BUBBLE_CLASS = 'any-file-message';

  private static createImage(imageData: MessageFile, asyncScroll?: () => void) {
    const imageElement = new Image();
    imageElement[SRC] = imageData[SRC] as string;
    if (asyncScroll) FileMessageUtils.scrollDownOnImageLoad(imageElement[SRC], asyncScroll);
    return FileMessageUtils.processContent(IMAGE, imageElement, imageElement[SRC], imageData.name);
  }

  // WORK - image still does not scroll down when loaded
  private static createImageMessage(msg: MessagesBase, image: MessageFile, role: string, scrollAllowed: boolean) {
    const elements = msg.createNewMessageElement('', role);
    const asyncScroll = scrollAllowed ? msg.scrollToFirstElement.bind(msg, role, scrollAllowed) : undefined;
    const imageEl = FileMessages.createImage(image, asyncScroll);
    elements.bubbleElement.appendChild(imageEl);
    elements.bubbleElement[CLASS_LIST].add(FileMessages.IMAGE_BUBBLE_CLASS);
    return {type: IMAGE, elements};
  }

  private static createAudioElement(audioData: MessageFile, role: string) {
    const audioElement = CREATE_ELEMENT(AUDIO) as HTMLAudioElement;
    audioElement[SRC] = audioData[SRC] as string;
    audioElement[CLASS_LIST].add('audio-player');
    audioElement.controls = true;
    if (Browser.IS_SAFARI) {
      audioElement[CLASS_LIST].add('audio-player-safari');
      audioElement[CLASS_LIST].add(role === USER ? 'audio-player-safari-end' : 'audio-player-safari-start');
    }
    return audioElement;
  }

  private static autoPlayAudio(audioElement: HTMLAudioElement) {
    audioElement.addEventListener('loadeddata', () => {
      audioElement.play().catch((error) => {
        console.warn('Auto-play failed:', error);
      });
    });
  }

  private static createNewAudioMessage(messages: MessagesBase, audioData: MessageFile, role: string, isTop: boolean) {
    const audioElement = FileMessages.createAudioElement(audioData, role);
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    elements.bubbleElement.appendChild(audioElement);
    elements.bubbleElement[CLASS_LIST].add(FileMessages.AUDIO_BUBBLE_CLASS);
    return {type: AUDIO, elements, audioElement};
  }

  private static createAnyFile(imageData: MessageFile) {
    const contents = CREATE_ELEMENT();
    contents[CLASS_LIST].add('any-file-message-contents');
    const svgContainer = CREATE_ELEMENT();
    svgContainer[CLASS_LIST].add('any-file-message-icon-container');
    const svgIconElement = SVGIconUtils.createSVGElement(FILE_ICON_STRING);
    svgIconElement[CLASS_LIST].add('any-file-message-icon');
    svgContainer.appendChild(svgIconElement);
    const fileNameElement = CREATE_ELEMENT();
    fileNameElement[CLASS_LIST].add('any-file-message-text');
    fileNameElement.textContent = imageData.name || FILE;
    contents.appendChild(svgContainer);
    contents.appendChild(fileNameElement);
    return FileMessageUtils.processContent(ANY, contents, imageData[SRC], fileNameElement.textContent);
  }

  private static createNewAnyFileMessage(messages: MessagesBase, data: MessageFile, role: string, isTop: boolean) {
    const elements = messages.createMessageElementsOnOrientation('', role, isTop);
    const anyFile = FileMessages.createAnyFile(data);
    elements.bubbleElement[CLASS_LIST].add(FileMessages.ANY_FILE_BUBBLE_CLASS);
    elements.bubbleElement.appendChild(anyFile);
    return {type: FILE, elements};
  }

  public static createMessages(msg: MessagesBase, files: MessageFiles, role: string, scroll: boolean, isTop = false) {
    return files
      .map((fileData, index) => {
        if (fileData.ref) fileData = FileMessageUtils.removeFileRef(fileData);
        if (FileMessageUtils.isAudioFile(fileData)) {
          const audioMessage = FileMessages.createNewAudioMessage(msg, fileData, role, isTop);
          const ttsConfig = msg.textToSpeech?.audio;
          if (ttsConfig) {
            if (ttsConfig.autoPlay) FileMessages.autoPlayAudio(audioMessage.audioElement);
            if (typeof ttsConfig.displayAudio === 'boolean' && !ttsConfig.displayAudio) return undefined;
          }
          return audioMessage;
        }
        if (FileMessageUtils.isImageFile(fileData)) {
          return FileMessages.createImageMessage(msg, fileData, role, !isTop && scroll && index === 0);
        }
        return FileMessages.createNewAnyFileMessage(msg, fileData, role, isTop);
      })
      .filter((element) => element !== undefined);
  }

  // no overwrite previous message logic as it is complex to track which files are to be overwritten
  public static addMessages(messages: MessagesBase, files: MessageFiles, role: string, scroll: boolean, isTop: boolean) {
    const typeToElements = FileMessages.createMessages(messages, files, role, scroll, isTop);
    typeToElements
      .filter((element) => element !== undefined)
      .forEach(({type, elements}) => {
        FileMessageUtils.addMessage(messages, elements, type as keyof MessageStyles, role, isTop);
      });
  }
}
