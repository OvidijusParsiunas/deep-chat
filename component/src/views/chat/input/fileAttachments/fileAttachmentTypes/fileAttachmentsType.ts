import {ANY, AUDIO, FILE, IMAGE, SRC} from '../../../../../utils/consts/messageConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../../utils/consts/htmlConstants';
import {ValidationHandler} from '../../../../../types/validationHandler';
import {FileAttachments} from '../../../../../types/fileAttachments';
import {AudioFileAttachmentType} from './audioFileAttachmentType';
import {MessageFileType} from '../../../../../types/messageFile';
import {CLICK} from '../../../../../utils/consts/inputConstants';
import {Browser} from '../../../../../utils/browser/browser';
import {ServiceIO} from '../../../../../services/serviceIO';
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
  private readonly _hiddenAttachments: Set<AttachmentObject> = new Set();
  private _validationHandler?: ValidationHandler;
  private _onInput: ((isUser: boolean) => void) | undefined;

  // prettier-ignore
  constructor(deepChat: DeepChat, serviceIO: ServiceIO, fileAttachments: FileAttachments,
      toggleContainer: (display: boolean) => void, container: HTMLElement) {
    if (fileAttachments.maxNumberOfFiles) this._fileCountLimit = fileAttachments.maxNumberOfFiles;
    this._toggleContainerDisplay = toggleContainer;
    this._fileAttachmentsContainerRef = container;
    if (fileAttachments.acceptedFormats) this._acceptedFormat = fileAttachments.acceptedFormats;
     // in a timeout as deepChat._validationHandler initialised later
    setTimeout(() => {
      this._validationHandler = deepChat._validationHandler;
      this._onInput = serviceIO.onInput;
    });
  }

  attemptAddFile(file: File, fileReaderResult: string) {
    if (FileAttachmentsType.isFileTypeValid(file, this._acceptedFormat)) {
      this.addAttachmentBasedOnType(file, fileReaderResult, true);
      this._onInput?.(true);
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
    if (type.startsWith(IMAGE)) return IMAGE;
    if (type.startsWith(AUDIO)) return AUDIO;
    return ANY;
  }

  private addAttachmentBasedOnType(file: File, fileReaderResult: string, removable: boolean) {
    const fileType = FileAttachmentsType.getTypeFromBlob(file);
    if (fileType === IMAGE) {
      const imageAttachment = FileAttachmentsType.createImageAttachment(fileReaderResult);
      this.addFileAttachment(file, IMAGE, imageAttachment, removable);
    } else if (fileType === AUDIO) {
      const audioAttachment = AudioFileAttachmentType.createAudioAttachment(fileReaderResult);
      this.addFileAttachment(file, AUDIO, audioAttachment, removable);
    } else {
      const anyFileAttachment = FileAttachmentsType.createAnyFileAttachment(file.name);
      this.addFileAttachment(file, ANY, anyFileAttachment, removable);
    }
  }

  private static createImageAttachment(src: string) {
    const image = new Image();
    image[SRC] = src;
    image[CLASS_LIST].add('image-attachment');
    return image;
  }

  private static createAnyFileAttachment(fileName: string) {
    const container = CREATE_ELEMENT();
    container[CLASS_LIST].add('border-bound-attachment');
    if (Browser.IS_SAFARI) container[CLASS_LIST].add('border-bound-attachment-safari');
    const text = CREATE_ELEMENT();
    text[CLASS_LIST].add('any-file-attachment-text');
    const textContainer = CREATE_ELEMENT();
    textContainer[CLASS_LIST].add('file-attachment-text-container');
    textContainer.appendChild(text);
    text.textContent = fileName;
    container.appendChild(textContainer);
    return container;
  }

  addFileAttachment(file: File, fileType: MessageFileType, attachmentElement: HTMLElement, removable: boolean) {
    const containerElement = FileAttachmentsType.createContainer(attachmentElement);
    if (this._attachments.length >= this._fileCountLimit) {
      const removeButton = this._attachments[this._attachments.length - 1].removeButton;
      removeButton?.[CLICK]();
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
    const containerElement = CREATE_ELEMENT();
    containerElement[CLASS_LIST].add('file-attachment');
    containerElement.appendChild(attachmentElement);
    return containerElement;
  }

  createRemoveAttachmentButton(attachmentObject: AttachmentObject) {
    const removeButtonElement = CREATE_ELEMENT();
    removeButtonElement[CLASS_LIST].add('remove-file-attachment-button');
    removeButtonElement.onclick = this.removeAttachment.bind(this, attachmentObject);
    const xIcon = CREATE_ELEMENT();
    xIcon[CLASS_LIST].add('x-icon');
    xIcon.innerText = '×';
    removeButtonElement.appendChild(xIcon);
    return removeButtonElement;
  }

  removeAttachment(attachmentObject: AttachmentObject, event?: MouseEvent) {
    const index = this._attachments.findIndex((attachment) => attachment === attachmentObject);
    if (index < 0) return; // fix for issue when `handler` returns result immediately
    this._onInput?.(!!event?.isTrusted);
    const containerElement = this._attachments[index].attachmentContainerElement;
    this._attachments.splice(index, 1);
    AudioFileAttachmentType.stopAttachmentPlayback(containerElement);
    containerElement.remove();
    this._toggleContainerDisplay(false);
    this._validationHandler?.();
  }

  getFiles() {
    return Array.from(this._attachments).map((attachment) => ({[FILE]: attachment[FILE], type: attachment.fileType}));
  }

  hideAttachments() {
    this._hiddenAttachments.clear();
    // the remove is in a timeout as otherwise the this._attachments.splice would cause iteration of the same file
    this._attachments.forEach((attachment) => {
      setTimeout(() => attachment.removeButton?.[CLICK]());
      this._hiddenAttachments.add(attachment);
    });
  }

  removeAttachments() {
    // the remove is in a timeout as otherwise the this._attachments.splice would cause iteration of the same file
    this._attachments.forEach((attachment) => {
      setTimeout(() => attachment.removeButton?.[CLICK]());
    });
    this._hiddenAttachments.clear();
  }

  readdAttachments() {
    Array.from(this._hiddenAttachments).forEach((attachment) => {
      this._fileAttachmentsContainerRef.appendChild(attachment.attachmentContainerElement);
      this._attachments.push(attachment);
    });
    this._onInput?.(false);
    this._hiddenAttachments.clear();
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
