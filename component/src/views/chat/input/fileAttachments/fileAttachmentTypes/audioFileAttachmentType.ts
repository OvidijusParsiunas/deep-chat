import {CLASS_LIST, CREATE_ELEMENT} from '../../../../../utils/consts/htmlConstants';
import {AUDIO, FILE, SRC} from '../../../../../utils/consts/messageConstants';
import {AttachmentObject, FileAttachmentsType} from './fileAttachmentsType';
import {ElementUtils} from '../../../../../utils/element/elementUtils';
import {FileAttachments} from '../../../../../types/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {CLICK} from '../../../../../utils/consts/inputConstants';
import {PLAY_ICON_STRING} from '../../../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../../../icons/stopIcon';
import {Browser} from '../../../../../utils/browser/browser';
import {ServiceIO} from '../../../../../services/serviceIO';
import {DeepChat} from '../../../../../deepChat';

export class AudioFileAttachmentType extends FileAttachmentsType {
  stopPlaceholderCallback?: () => Promise<void>;
  private _activePlaceholderTimer?: number;
  private _activePlaceholderAttachment?: AttachmentObject;
  private static readonly TIMER_LIMIT_S = 5999;

  // prettier-ignore
  constructor(deepChat: DeepChat, serviceIO: ServiceIO, fileAttachments: FileAttachments,
      toggleContainer: (display: boolean) => void, container: HTMLElement) {
    super(deepChat, serviceIO, fileAttachments, toggleContainer, container);
  }

  private static createAudioContainer() {
    const container = CREATE_ELEMENT();
    container[CLASS_LIST].add('border-bound-attachment', 'audio-attachment-icon-container');
    if (Browser.IS_SAFARI) container[CLASS_LIST].add('border-bound-attachment-safari');
    return container;
  }

  private static addAudioElements(oldContainer: HTMLElement, fileReaderResult: string) {
    // this is a simple workaround to remove all event listeners from the placeholder element
    const container = oldContainer.parentElement ? ElementUtils.cloneElement(oldContainer) : oldContainer;
    const audio = CREATE_ELEMENT(AUDIO) as HTMLAudioElement;
    audio[SRC] = fileReaderResult;
    const play = SVGIconUtils.createSVGElement(PLAY_ICON_STRING);
    play[CLASS_LIST].add('attachment-icon', 'play-icon');
    const stop = SVGIconUtils.createSVGElement(STOP_ICON_STRING);
    stop[CLASS_LIST].add('attachment-icon', 'stop-icon');
    container.replaceChildren(play);
    audio.onplay = () => {
      container.replaceChildren(stop);
    };
    audio.onpause = () => {
      container.replaceChildren(play);
      audio.currentTime = 0;
    };
    audio.onended = () => {
      container.replaceChildren(play);
    };
    container.onclick = () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    };
  }

  public static createAudioAttachment(fileReaderResult: string) {
    const container = AudioFileAttachmentType.createAudioContainer();
    AudioFileAttachmentType.addAudioElements(container, fileReaderResult);
    return container;
  }

  private createTimer(text: HTMLElement, customTimeLimit?: number) {
    let time = 0;
    const secondsLimit =
      customTimeLimit !== undefined && customTimeLimit < AudioFileAttachmentType.TIMER_LIMIT_S
        ? customTimeLimit
        : AudioFileAttachmentType.TIMER_LIMIT_S;
    return setInterval(() => {
      time += 1;
      if (time === secondsLimit) {
        this.stopPlaceholderCallback?.();
        this.clearTimer();
      }
      if (time === 600) text[CLASS_LIST].add('audio-placeholder-text-4-digits');
      const minutes = Math.floor(time / 60);
      const seconds = (time % 60).toString().padStart(2, '0');
      text.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  private createPlaceholderAudioAttachment(customTimeLimit?: number) {
    const container = AudioFileAttachmentType.createAudioContainer();
    const text = CREATE_ELEMENT();
    text[CLASS_LIST].add('audio-placeholder-text-3-digits');
    const textContainer = CREATE_ELEMENT();
    textContainer[CLASS_LIST].add('file-attachment-text-container', 'audio-placeholder-text-3-digits-container');
    textContainer.appendChild(text);
    const stop = SVGIconUtils.createSVGElement(STOP_ICON_STRING);
    stop[CLASS_LIST].add('attachment-icon', 'stop-icon', 'not-removable-attachment-icon');
    text.textContent = '0:00';
    this._activePlaceholderTimer = this.createTimer(text, customTimeLimit);
    container.appendChild(textContainer);
    this.addPlaceholderAudioAttachmentEvents(container, stop, textContainer);
    return container;
  }

  private addPlaceholderAudioAttachmentEvents(container: HTMLElement, stop: SVGElement, textContainer: HTMLElement) {
    const mouseEnter = () => container.replaceChildren(stop);
    container.addEventListener('mouseenter', mouseEnter);
    const mouseLeave = () => container.replaceChildren(textContainer);
    container.addEventListener('mouseleave', mouseLeave);
    const click = () => this.stopPlaceholderCallback?.();
    container.addEventListener(CLICK, click);
  }

  addPlaceholderAttachment(stopCallback: () => Promise<void>, customTimeLimit?: number) {
    const audioAttachment = this.createPlaceholderAudioAttachment(customTimeLimit);
    this._activePlaceholderAttachment = this.addFileAttachment(new File([], ''), AUDIO, audioAttachment, false);
    this.stopPlaceholderCallback = stopCallback;
  }

  // prettier-ignore
  completePlaceholderAttachment(file: File, fileReaderResult: string) {
    const attachmentObj = this._activePlaceholderAttachment;
    if (!attachmentObj) return;
    attachmentObj[FILE] = file;
    AudioFileAttachmentType.addAudioElements(
      attachmentObj.attachmentContainerElement.children[0] as HTMLElement, fileReaderResult);
    attachmentObj.removeButton = this.createRemoveAttachmentButton(attachmentObj);
    attachmentObj.attachmentContainerElement.appendChild(attachmentObj.removeButton);
    this._activePlaceholderAttachment = undefined;
    this.clearTimer();
  }

  removePlaceholderAttachment() {
    if (this._activePlaceholderAttachment) {
      this.removeAttachment(this._activePlaceholderAttachment);
      this._activePlaceholderAttachment = undefined;
      this.clearTimer();
    }
  }

  private clearTimer() {
    if (this._activePlaceholderTimer !== undefined) {
      clearInterval(this._activePlaceholderTimer);
      this._activePlaceholderTimer = undefined;
      this.stopPlaceholderCallback = undefined;
    }
  }

  public static stopAttachmentPlayback(attachmentContainerEl: HTMLElement) {
    if (attachmentContainerEl.children[0]?.children?.[0]?.[CLASS_LIST].contains('stop-icon')) {
      (attachmentContainerEl.children[0] as HTMLElement)[CLICK]();
    }
  }
}
