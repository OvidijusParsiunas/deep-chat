import {ServiceFileTypes, ServiceIO} from '../../../../services/serviceIO';
import {FileAttachmentsType} from './fileAttachmentsType';
import {CustomStyle} from '../../../../types/styles';

export class FileAttachments {
  private readonly _fileAttachmentsTypes: FileAttachmentsType[] = [];
  private readonly containerElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, serviceIO?: ServiceIO, attachmentContainerStyle?: CustomStyle) {
    this.containerElementRef = this.createAttachmentContainer();
    this.toggleContainerDisplay(false);
    inputElementRef.appendChild(this.containerElementRef);
    const fileTypes = serviceIO?.fileTypes || {};
    Object.keys(fileTypes).forEach((key) => {
      const files = fileTypes[key as keyof ServiceFileTypes]?.files;
      if (files) {
        const fileAttachmentsType = new FileAttachmentsType(files, this.toggleContainerDisplay.bind(this));
        this._fileAttachmentsTypes.push(fileAttachmentsType);
      }
    });
    if (attachmentContainerStyle) Object.assign(this.containerElementRef.style, attachmentContainerStyle);
  }

  private createAttachmentContainer() {
    const attachmentContainerElement = document.createElement('div');
    attachmentContainerElement.id = 'file-attachment-container';
    return attachmentContainerElement;
  }

  private toggleContainerDisplay(display: boolean) {
    if (display) {
      this.containerElementRef.style.display = 'block';
    } else if (this.containerElementRef.children.length === 0) {
      this.containerElementRef.style.display = 'none';
    }
  }

  getAllFiles() {
    return this._fileAttachmentsTypes.map((fileAttachmentType) => Array.from(fileAttachmentType._files)).flat();
  }

  // prettier-ignore
  public addFiles(files: File[], isDragAndDrop = false) {
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        for (let i = 0; this._fileAttachmentsTypes.length; i += 1) {
          const result = this._fileAttachmentsTypes[i].attemptAddFile(file,
            (event.target as FileReader).result as string, this.containerElementRef, isDragAndDrop);
          if (result) break;
        }
      };
    });
  }

  removeAllFiles() {
    this._fileAttachmentsTypes.forEach((fileAttachmentsType) => fileAttachmentsType._files.clear());
    this.containerElementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }
}