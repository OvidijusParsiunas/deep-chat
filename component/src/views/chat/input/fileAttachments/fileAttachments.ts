import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {FileAttachmentsType} from './fileAttachmentsType';
import {CustomStyle} from '../../../../types/styles';

export class FileAttachments {
  private readonly _fileAttachmentsTypes: FileAttachmentsType[] = [];
  private readonly _containerElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, attachmentContainerStyle?: CustomStyle) {
    this._containerElementRef = this.createAttachmentContainer();
    this.toggleContainerDisplay(false);
    inputElementRef.appendChild(this._containerElementRef);
    if (attachmentContainerStyle) Object.assign(this._containerElementRef.style, attachmentContainerStyle);
  }

  // prettier-ignore
  addType(files: FileAttachmentsT) {
    const fileAttachmentsType = new FileAttachmentsType(
      files, this.toggleContainerDisplay.bind(this), this._containerElementRef);
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
      this._containerElementRef.style.display = 'block';
    } else if (this._containerElementRef.children.length === 0) {
      this._containerElementRef.style.display = 'none';
    }
  }

  getAllFileData() {
    const files = this._fileAttachmentsTypes.map((fileAttachmentType) => fileAttachmentType.getFiles()).flat();
    return files.length > 0 ? files : undefined;
  }

  public static addFilesToType(files: File[], fileAttachmentTypes: FileAttachmentsType[]) {
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        for (let i = 0; i < fileAttachmentTypes.length; i += 1) {
          const result = fileAttachmentTypes[i].attemptAddFile(file, (event.target as FileReader).result as string);
          if (result) break;
        }
      };
    });
  }

  public addFilesToAnyType(files: File[]) {
    FileAttachments.addFilesToType(files, this._fileAttachmentsTypes);
  }

  removeAllFiles() {
    this._fileAttachmentsTypes.forEach((fileAttachmentsType) => fileAttachmentsType.clear());
    this._containerElementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }
}
