import {FileAttachments} from '../../../../types/fileAttachments';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {MessageFileType} from '../../../../types/messageFile';
import {PLAY_ICON_STRING} from '../../../../icons/playIcon';
import {STOP_ICON_STRING} from '../../../../icons/stopIcon';

interface AttachmentObject {
  file: File;
  fileType: MessageFileType;
  attachmentElement: HTMLElement;
}

export class FileAttachmentsType {
  private _attachments: AttachmentObject[] = [];
  private readonly _fileCountLimit: number = 99;
  private readonly _toggleContainerDisplay: (display: boolean) => void;
  private readonly _fileAttachmentsContainerRef: HTMLElement;
  private readonly _type: MessageFileType;
  private readonly _acceptedFormat: string = '';

  // prettier-ignore
  constructor(fileAttachments: FileAttachments, toggleContainerDisplay: (display: boolean) => void, container: HTMLElement,
      type: MessageFileType) {
    if (fileAttachments.maxNumberOfFiles) this._fileCountLimit = fileAttachments.maxNumberOfFiles;
    this._type = type;
    this._toggleContainerDisplay = toggleContainerDisplay;
    this._fileAttachmentsContainerRef = container;
    if (fileAttachments.acceptedFormats) this._acceptedFormat = fileAttachments.acceptedFormats;
  }

  attemptAddFile(file: File, fileReaderResult: string) {
    if (FileAttachmentsType.isFileTypeValid(file, this._acceptedFormat)) {
      this.addAttachmentBasedOnType(file, fileReaderResult);
      return true;
    }
    return false;
  }

  private static isFileTypeValid(file: File, accept: string) {
    const validTypes = accept.split(',');
    for (let i = 0; i < validTypes.length; i++) {
      const validType = validTypes[i].trim();
      if (file.type === validType) {
        return true;
      } else if (validType.startsWith('.')) {
        const extension = validType.slice(1);
        if (file.name.endsWith(extension)) {
          return true;
        }
      } else if (validType.endsWith('/*') && file.type.startsWith(validType.slice(0, -2))) {
        return true;
      }
    }
    return false;
  }

  private addAttachmentBasedOnType(file: File, fileReaderResult: string) {
    if (file.type.startsWith('image')) {
      const imageAttachment = FileAttachmentsType.createImageAttachment(fileReaderResult);
      this.addFileAttachment(file, imageAttachment);
    } else if (file.type.startsWith('audio')) {
      const audioAttachment = FileAttachmentsType.createAudioAttachment(fileReaderResult);
      this.addFileAttachment(file, audioAttachment);
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
    container.classList.add('audio-attachment-icon-container');
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

  private addFileAttachment(file: File, attachmentElement: HTMLElement) {
    const attachmentObject = {file, attachmentElement, fileType: this._type};
    if (this._attachments.length >= this._fileCountLimit) {
      const attachmentContainer = this._attachments[this._attachments.length - 1].attachmentElement.parentElement;
      (attachmentContainer?.children[1] as HTMLElement).click();
      const attachments = this._fileAttachmentsContainerRef.children;
      this._fileAttachmentsContainerRef.insertBefore(this.createContainer(attachmentObject), attachments[0]);
    } else {
      this._fileAttachmentsContainerRef.appendChild(this.createContainer(attachmentObject));
    }
    this._toggleContainerDisplay(true);
    this._attachments.push(attachmentObject);
  }

  private createContainer(attachmentObject: AttachmentObject) {
    const containerElement = document.createElement('div');
    containerElement.classList.add('file-attachment');
    containerElement.appendChild(attachmentObject.attachmentElement);
    containerElement.appendChild(this.createRemoveAttachmentButton(attachmentObject, containerElement));
    return containerElement;
  }

  private createRemoveAttachmentButton(attachmentObject: AttachmentObject, containerElement: HTMLElement) {
    const removeButtonElement = document.createElement('div');
    removeButtonElement.classList.add('remove-file-attachment-button');
    removeButtonElement.onclick = this.removeFile.bind(this, attachmentObject, containerElement);
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeButtonElement.appendChild(xIcon);
    return removeButtonElement;
  }

  private removeFile(attachmentObject: AttachmentObject, containerElement: HTMLElement) {
    const index = this._attachments.findIndex((attachment) => attachment === attachmentObject);
    this._attachments.splice(index, 1);
    if (attachmentObject.attachmentElement?.children?.[0]?.classList.contains('stop-icon')) {
      attachmentObject.attachmentElement.click();
    }
    containerElement.remove();
    this._toggleContainerDisplay(false);
  }

  getFiles() {
    return Array.from(this._attachments).map((attachment) => ({file: attachment.file, type: attachment.fileType}));
  }

  clear() {
    this._attachments = [];
  }
}

/* Drag sort functionality

  private dragSrcEl?: HTMLElement;

  private drop(e) {
    e.stopPropagation();
    if (this.dragSrcEl) {
      console.log(this.dragSrcEl);
      this.dragSrcEl.style.filter = '';
    }
  }

  private dragOver(e) {
    if (this.isBefore(this.dragSrcEl, e.target)) {
      e.target.parentNode.insertBefore(this.dragSrcEl, e.target);
    } else {
      e.target.parentNode.insertBefore(this.dragSrcEl, e.target.nextSibling);
    }
  }

  private dragStart(element: HTMLElement, e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', null); // Thanks to bqlou for their comment.
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    // e.dataTransfer.setDragImage(img, 0, 0);
    this.dragSrcEl = element;
    setTimeout(() => {
      element.style.filter = 'contrast(0.5)';
    });
  }

  private isBefore(el1, el2) {
    if (el2.parentNode === el1.parentNode)
      for (let cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling)
        if (cur === el2) return true;
    return false;
  }

  draggable = true;

  .file-attachment > * {
    pointer-events: none;
  }
*/
