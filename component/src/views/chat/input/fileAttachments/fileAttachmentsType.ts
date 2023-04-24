import {FileAttachments} from '../../../../types/fileAttachments';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {PLAY_ICON_STRING} from '../../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../../icons/stopIcon';

export class FileAttachmentsType {
  readonly _files: Set<File> = new Set();
  readonly _fileCountLimit: number = 99;
  readonly _acceptedTypePrefixes?: string[];
  readonly _acceptedFileNamePostfixes?: string[];
  readonly _toggleContainerDisplay: (display: boolean) => void;

  constructor(fileAttachments: FileAttachments, toggleContainerDisplay: (display: boolean) => void) {
    if (fileAttachments.maxNumberOfFiles) this._fileCountLimit = fileAttachments.maxNumberOfFiles;
    if (typeof fileAttachments.dragAndDrop === 'object') {
      this._acceptedTypePrefixes = fileAttachments.dragAndDrop.acceptedTypePrefixes;
      this._acceptedFileNamePostfixes = fileAttachments.dragAndDrop.acceptedFileNamePostfixes;
    }
    this._toggleContainerDisplay = toggleContainerDisplay;
  }

  attemptAddFile(file: File, fileReaderResult: string, containerElementRef: HTMLElement, isDragAndDrop: boolean) {
    if (isDragAndDrop) {
      if (this._acceptedTypePrefixes) {
        if (!this._acceptedTypePrefixes.find((prefix) => file.type.startsWith(prefix))) return false;
      }
      if (this._acceptedFileNamePostfixes) {
        if (!this._acceptedFileNamePostfixes.find((postfix) => file.name.endsWith(postfix))) return false;
      }
    }
    this.addAttachmentBasedOnType(file, fileReaderResult, containerElementRef);
    return true;
  }

  private addAttachmentBasedOnType(file: File, fileReaderResult: string, containerElementRef: HTMLElement) {
    if (file.type.startsWith('image')) {
      const imageAttachment = FileAttachmentsType.createImageAttachment(fileReaderResult);
      this.addFileAttachment(file, containerElementRef, imageAttachment);
    } else if (file.type.startsWith('audio')) {
      const imageAttachment = FileAttachmentsType.createAudioAttachment(fileReaderResult);
      this.addFileAttachment(file, containerElementRef, imageAttachment);
    }
  }

  private static createImageAttachment(src: string) {
    const image = new Image();
    image.src = src;
    image.classList.add('image-attachment');
    return image;
  }

  private static createAudioAttachment(fileReaderResult: string) {
    const container = document.createElement('div');
    container.classList.add('audio-attachment');
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
    return container;
  }

  private addFileAttachment(file: File, containerElementRef: HTMLElement, attachmentElement: HTMLElement) {
    // TO-DO - will have to remove the first of type
    if (this._files.size >= this._fileCountLimit) {
      const attachments = containerElementRef.children;
      (attachments[attachments.length - 1].children[1] as HTMLElement).click();
      containerElementRef.insertBefore(this.createContainer(file, attachmentElement), attachments[0]);
    } else {
      containerElementRef.appendChild(this.createContainer(file, attachmentElement));
    }
    this._toggleContainerDisplay(true);
    this._files.add(file);
  }

  private createContainer(file: File, attachmentElement: HTMLElement) {
    const fileAttachmentElement = document.createElement('div');
    fileAttachmentElement.classList.add('file-attachment');
    fileAttachmentElement.appendChild(attachmentElement);
    fileAttachmentElement.appendChild(this.createRemoveAttachmentButton(file, fileAttachmentElement));
    return fileAttachmentElement;
  }

  private createRemoveAttachmentButton(file: File, attachmentElement: HTMLElement) {
    const removeButtonElement = document.createElement('div');
    removeButtonElement.classList.add('remove-file-attachment-button');
    removeButtonElement.onclick = this.removeFile.bind(this, file, attachmentElement);
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeButtonElement.appendChild(xIcon);
    return removeButtonElement;
  }

  private removeFile(file: File, attachmentElement: HTMLElement) {
    this._files.delete(file);
    attachmentElement.remove();
    this._toggleContainerDisplay(false);
  }
}
