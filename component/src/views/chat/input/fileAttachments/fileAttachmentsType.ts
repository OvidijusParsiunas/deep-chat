import {FileAttachments} from '../../../../types/fileAttachments';
import audio from './File-Audio-256.png';

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

  attemptAddFile(file: File, fileReaderResult: string, containerElementRef: HTMLElement) {
    if (this._acceptedTypePrefixes) {
      if (!this._acceptedTypePrefixes.find((prefix) => file.type.startsWith(prefix))) return false;
    }
    if (this._acceptedFileNamePostfixes) {
      if (!this._acceptedFileNamePostfixes.find((postfix) => file.name.endsWith(postfix))) return false;
    }
    this.addAttachmentBasedOnType(file, fileReaderResult, containerElementRef);
    return true;
  }

  private addAttachmentBasedOnType(file: File, fileReaderResult: string, containerElementRef: HTMLElement) {
    if (file.type.startsWith('image')) {
      const imageAttachment = FileAttachmentsType.createImageAttachment(fileReaderResult);
      this.addFileAttachment(file, containerElementRef, imageAttachment);
    } else if (file.type.startsWith('audio')) {
      const imageAttachment = FileAttachmentsType.createImageAttachment(audio);
      this.addFileAttachment(file, containerElementRef, imageAttachment);
    }
  }

  private static createImageAttachment(src: string) {
    const image = new Image();
    image.src = src;
    image.classList.add('image-attachment');
    return image;
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

  // TO-DO - util
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
