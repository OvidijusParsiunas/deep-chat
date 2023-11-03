import {AttachmentObject, FileAttachmentsType} from './fileAttachmentsType';
import {ElementUtils} from '../../../../../utils/element/elementUtils';
import {FileAttachments} from '../../../../../types/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {PLAY_ICON_STRING} from '../../../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../../../icons/stopIcon';
import {Browser} from '../../../../../utils/browser/browser';
import {DeepChat} from '../../../../../deepChat';

export class AudioFileAttachmentType extends FileAttachmentsType {
  stopPlaceholderCallback?: () => Promise<void>;
  private _activePlaceholderTimer?: number;
  private _activePlaceholderAttachment?: AttachmentObject;
  private static readonly TIMER_LIMIT_S = 5999;

  // prettier-ignore
  constructor(deepChat: DeepChat, fileAttachments: FileAttachments,
      toggleContainer: (display: boolean) => void, container: HTMLElement) {
    super(deepChat, fileAttachments, toggleContainer, container);
  }

  private static createAudioContainer() {
    const container = document.createElement('div');
    container.classList.add('border-bound-attachment', 'audio-attachment-icon-container');
    if (Browser.IS_SAFARI) container.classList.add('border-bound-attachment-safari');
    return container;
  }

  private static addAudioElements(oldContainer: HTMLElement, fileReaderResult: string) {
    // this is a simple workaround to remove all event listeners from the placeholder element
    const container = oldContainer.parentElement ? ElementUtils.cloneElement(oldContainer) : oldContainer;
    const audio = document.createElement('audio');
    audio.src = fileReaderResult;
    const play = SVGIconUtils.createSVGElement(PLAY_ICON_STRING);
    play.classList.add('attachment-icon', 'play-icon');
    const stop = SVGIconUtils.createSVGElement(STOP_ICON_STRING);
    stop.classList.add('attachment-icon', 'stop-icon');
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
      if (time === 600) text.classList.add('audio-placeholder-text-4-digits');
      const minutes = Math.floor(time / 60);
      const seconds = (time % 60).toString().padStart(2, '0');
      text.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  private createPlaceholderAudioAttachment(customTimeLimit?: number) {
    const container = AudioFileAttachmentType.createAudioContainer();
    const text = document.createElement('div');
    text.classList.add('audio-placeholder-text-3-digits');
    const textContainer = document.createElement('div');
    textContainer.classList.add('file-attachment-text-container', 'audio-placeholder-text-3-digits-container');
    textContainer.appendChild(text);
    const stop = SVGIconUtils.createSVGElement(STOP_ICON_STRING);
    stop.classList.add('attachment-icon', 'stop-icon', 'not-removable-attachment-icon');
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
    container.addEventListener('click', click);
  }

  addPlaceholderAttachment(stopCallback: () => Promise<void>, customTimeLimit?: number) {
    const audioAttachment = this.createPlaceholderAudioAttachment(customTimeLimit);
    this._activePlaceholderAttachment = this.addFileAttachment(new File([], ''), 'audio', audioAttachment, false);
    this.stopPlaceholderCallback = stopCallback;
  }

  // prettier-ignore
  completePlaceholderAttachment(file: File, fileReaderResult: string) {
    const attachmentObj = this._activePlaceholderAttachment;
    if (!attachmentObj) return;
    attachmentObj.file = file;
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
    if (attachmentContainerEl.children[0]?.children?.[0]?.classList.contains('stop-icon')) {
      (attachmentContainerEl.children[0] as HTMLElement).click();
    }
  }
}
