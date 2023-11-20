import {ValidationHandler} from '../../../../../types/validationHandler';
import {FileAttachments} from '../../../../../types/fileAttachments';
import {AudioFileAttachmentType} from './audioFileAttachmentType';
import {MessageFileType} from '../../../../../types/messageFile';
import {Browser} from '../../../../../utils/browser/browser';
import {DeepChat} from '../../../../../deepChat';

export interface AttachmentObject {
  file: File;
  fileType: MessageFileType;
  attachmentContainerElement: HTMLElement;
  removeButton?: HTMLElement;
}

export class FileAttachmentsType {
  private readonly _attachments: AttachmentObject[] = [];
  private readonly _fileCountLimit: number = 99;
  private readonly _toggleContainerDisplay: (display: boolean) => void;
  private readonly _fileAttachmentsContainerRef: HTMLElement;
  private readonly _acceptedFormat: string = '';
  private _validationHandler?: ValidationHandler;

  // prettier-ignore
  constructor(deepChat: DeepChat, fileAttachments: FileAttachments, toggleContainer: (display: boolean) => void,
      container: HTMLElement) {
    if (fileAttachments.maxNumberOfFiles) this._fileCountLimit = fileAttachments.maxNumberOfFiles;
    this._toggleContainerDisplay = toggleContainer;
    this._fileAttachmentsContainerRef = container;
    if (fileAttachments.acceptedFormats) this._acceptedFormat = fileAttachments.acceptedFormats;
     // in a timeout as deepChat._validationHandler initialised later
    setTimeout(() => {this._validationHandler = deepChat._validationHandler;});
  }

  attemptAddFile(file: File, fileReaderResult: string) {
    if (FileAttachmentsType.isFileTypeValid(file, this._acceptedFormat)) {
      this.addAttachmentBasedOnType(file, fileReaderResult, true);
      return true;
    }
    return false;
  }

  private static isFileTypeValid(file: File, accept: string) {
    if (accept === '') return true;
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
      } else if (file.name.endsWith(validType)) {
        return true;
      } else if (validType.endsWith('/*') && file.type.startsWith(validType.slice(0, -2))) {
        return true;
      }
    }
    return false;
  }

  public static getTypeFromBlob(file: File): MessageFileType {
    const {type} = file;
    if (type.startsWith('image')) return 'image';
    if (type.startsWith('audio')) return 'audio';
    return 'any';
  }

  private addAttachmentBasedOnType(file: File, fileReaderResult: string, removable: boolean) {
    const imageType = FileAttachmentsType.getTypeFromBlob(file);
    if (imageType === 'image') {
      const imageAttachment = FileAttachmentsType.createImageAttachment(fileReaderResult);
      this.addFileAttachment(file, 'image', imageAttachment, removable);
    } else if (imageType === 'audio') {
      const audioAttachment = AudioFileAttachmentType.createAudioAttachment(fileReaderResult);
      this.addFileAttachment(file, 'audio', audioAttachment, removable);
    } else {
      const anyFileAttachment = FileAttachmentsType.createAnyFileAttachment(file.name);
      this.addFileAttachment(file, 'any', anyFileAttachment, removable);
    }
  }

  private static createImageAttachment(src: string) {
    const image = new Image();
    image.src = src;
    image.classList.add('image-attachment');
    return image;
  }

  private static createAnyFileAttachment(fileName: string) {
    const container = document.createElement('div');
    container.classList.add('border-bound-attachment');
    if (Browser.IS_SAFARI) container.classList.add('border-bound-attachment-safari');
    const text = document.createElement('div');
    text.classList.add('any-file-attachment-text');
    const textContainer = document.createElement('div');
    textContainer.classList.add('file-attachment-text-container');
    textContainer.appendChild(text);
    text.textContent = fileName;
    container.appendChild(textContainer);
    return container;
  }

  addFileAttachment(file: File, fileType: MessageFileType, attachmentElement: HTMLElement, removable: boolean) {
    const containerElement = FileAttachmentsType.createContainer(attachmentElement);
    if (this._attachments.length >= this._fileCountLimit) {
      const removeButton = this._attachments[this._attachments.length - 1].removeButton;
      removeButton?.click();
      const attachments = this._fileAttachmentsContainerRef.children;
      this._fileAttachmentsContainerRef.insertBefore(containerElement, attachments[0]);
    } else {
      this._fileAttachmentsContainerRef.appendChild(containerElement);
    }
    const attachmentObject: AttachmentObject = {file, attachmentContainerElement: containerElement, fileType};
    if (removable) {
      attachmentObject.removeButton = this.createRemoveAttachmentButton(attachmentObject);
      containerElement.appendChild(attachmentObject.removeButton);
    }
    this._toggleContainerDisplay(true);
    this._attachments.push(attachmentObject);
    this._fileAttachmentsContainerRef.scrollTop = this._fileAttachmentsContainerRef.scrollHeight;
    this._validationHandler?.();
    return attachmentObject;
  }

  private static createContainer(attachmentElement: HTMLElement) {
    const containerElement = document.createElement('div');
    containerElement.classList.add('file-attachment');
    containerElement.appendChild(attachmentElement);
    return containerElement;
  }

  createRemoveAttachmentButton(attachmentObject: AttachmentObject) {
    const removeButtonElement = document.createElement('div');
    removeButtonElement.classList.add('remove-file-attachment-button');
    removeButtonElement.onclick = this.removeAttachment.bind(this, attachmentObject);
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeButtonElement.appendChild(xIcon);
    return removeButtonElement;
  }

  removeAttachment(attachmentObject: AttachmentObject) {
    const index = this._attachments.findIndex((attachment) => attachment === attachmentObject);
    const containerElement = this._attachments[index].attachmentContainerElement;
    this._attachments.splice(index, 1);
    AudioFileAttachmentType.stopAttachmentPlayback(containerElement);
    containerElement.remove();
    this._toggleContainerDisplay(false);
    this._validationHandler?.();
  }

  getFiles() {
    return Array.from(this._attachments).map((attachment) => ({file: attachment.file, type: attachment.fileType}));
  }

  removeAllAttachments() {
    // the remove is in a timeout as otherwise the this._attachments.splice would cause iteration of the same file
    this._attachments.forEach((attachment) => {
      setTimeout(() => attachment.removeButton?.click());
    });
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
