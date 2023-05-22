import {FileAttachmentTypeFactory} from './fileAttachmentTypes/fileAttachmentTypeFactory';
import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {AudioFileAttachmentType} from './fileAttachmentTypes/audioFileAttachmentType';
import {FileAttachmentsType} from './fileAttachmentTypes/fileAttachmentsType';
import {ServiceFileTypes} from '../../../../services/serviceIO';
import {CustomStyle} from '../../../../types/styles';
import {Demo} from '../../../../types/demo';

export class FileAttachments {
  private readonly _fileAttachmentsTypes: FileAttachmentsType[] = [];
  private readonly _containerElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, attachmentContainerStyle?: CustomStyle, demo?: Demo) {
    this._containerElementRef = this.createAttachmentContainer();
    const displayOnStartup = typeof demo === 'object' && !!demo.displayFileAttachmentContainer;
    this.toggleContainerDisplay(displayOnStartup);
    inputElementRef.appendChild(this._containerElementRef);
    if (attachmentContainerStyle) Object.assign(this._containerElementRef.style, attachmentContainerStyle);
  }

  // prettier-ignore
  addType(files: FileAttachmentsT, type: keyof ServiceFileTypes) {
    const fileAttachmentsType = FileAttachmentTypeFactory.create(
      files, this.toggleContainerDisplay.bind(this), this._containerElementRef, type);
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

  async completePlaceholders() {
    await Promise.all(
      this._fileAttachmentsTypes.map(async (fileAttachmentsType) =>
        (fileAttachmentsType as AudioFileAttachmentType).stopPlaceholderCallback?.()
      )
    );
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
    this._fileAttachmentsTypes.forEach((fileAttachmentsType) => fileAttachmentsType.removeAllAttachments());
    this._containerElementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }

  getNumberOfTypes() {
    return this._fileAttachmentsTypes.length;
  }
}
