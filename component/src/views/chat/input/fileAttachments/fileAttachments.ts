import {FileAttachmentTypeFactory} from './fileAttachmentTypes/fileAttachmentTypeFactory';
import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {AudioFileAttachmentType} from './fileAttachmentTypes/audioFileAttachmentType';
import {FileAttachmentsType} from './fileAttachmentTypes/fileAttachmentsType';
import {ServiceFileTypes} from '../../../../services/serviceIO';
import {CustomStyle} from '../../../../types/styles';
import {DeepChat} from '../../../../deepChat';
import {Demo} from '../../../../types/demo';

export class FileAttachments {
  private readonly _fileAttachmentsTypes: FileAttachmentsType[] = [];
  readonly elementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, attachmentContainerStyle?: CustomStyle, demo?: Demo) {
    this.elementRef = this.createAttachmentContainer();
    const displayOnStartup = typeof demo === 'object' && !!demo.displayFileAttachmentContainer;
    this.toggleContainerDisplay(displayOnStartup);
    inputElementRef.appendChild(this.elementRef);
    if (attachmentContainerStyle) Object.assign(this.elementRef.style, attachmentContainerStyle);
  }

  // prettier-ignore
  addType(deepChat: DeepChat, files: FileAttachmentsT, type: keyof ServiceFileTypes) {
    const fileAttachmentsType = FileAttachmentTypeFactory.create(
      deepChat, files, this.toggleContainerDisplay.bind(this), this.elementRef, type);
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
      this.elementRef.style.display = 'block';
    } else if (this.elementRef.children.length === 0) {
      this.elementRef.style.display = 'none';
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

  addFilesToAnyType(files: File[]) {
    FileAttachments.addFilesToType(files, this._fileAttachmentsTypes);
  }

  removeAllFiles() {
    this._fileAttachmentsTypes.forEach((fileAttachmentsType) => fileAttachmentsType.removeAllAttachments());
    this.elementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }

  getNumberOfTypes() {
    return this._fileAttachmentsTypes.length;
  }
}
