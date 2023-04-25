import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {FileAttachmentsType} from './fileAttachmentsType';
import {CustomStyle} from '../../../../types/styles';

export class FileAttachments {
  private readonly _fileAttachmentsTypes: FileAttachmentsType[] = [];
  private readonly containerElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, attachmentContainerStyle?: CustomStyle) {
    this.containerElementRef = this.createAttachmentContainer();
    this.toggleContainerDisplay(false);
    inputElementRef.appendChild(this.containerElementRef);
    if (attachmentContainerStyle) Object.assign(this.containerElementRef.style, attachmentContainerStyle);
  }

  // prettier-ignore
  addType(files: FileAttachmentsT) {
    const fileAttachmentsType = new FileAttachmentsType(
      files, this.toggleContainerDisplay.bind(this), this.containerElementRef);
    this._fileAttachmentsTypes.push(fileAttachmentsType);
    return fileAttachmentsType;
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
    return this._fileAttachmentsTypes.map((fileAttachmentType) => Array.from(fileAttachmentType.getFiles())).flat();
  }

  // prettier-ignore
  public static addFiles(files: File[], fileAttachmentTypes: FileAttachmentsType[], isDragAndDrop = false) {
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        for (let i = 0; fileAttachmentTypes.length; i += 1) {
          const result = fileAttachmentTypes[i].attemptAddFile(file,
            (event.target as FileReader).result as string, isDragAndDrop);
          if (result) break;
        }
      };
    });
  }

  public addFilesFromDragAndDrop(files: File[]) {
    FileAttachments.addFiles(files, this._fileAttachmentsTypes, true);
  }

  removeAllFiles() {
    this._fileAttachmentsTypes.forEach((fileAttachmentsType) => fileAttachmentsType.clear());
    this.containerElementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }
}
