import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';

export class FileAttachments {
  private readonly _files: Set<File> = new Set();
  private readonly containerElementRef: HTMLElement;
  readonly fileLimit: number = 99;

  constructor(inputElementRef: HTMLElement, fileAttachments?: FileAttachmentsT, maxNumberOfImages?: number) {
    this.containerElementRef = this.createAttachmentContainer();
    this.toggleContainerDisplay(false);
    inputElementRef.appendChild(this.containerElementRef);
    if (fileAttachments?.attachmentContainerStyle) {
      Object.assign(this.containerElementRef.style, fileAttachments.attachmentContainerStyle);
    }
    if (maxNumberOfImages && maxNumberOfImages > 0) this.fileLimit = maxNumberOfImages;
  }

  private createAttachmentContainer() {
    const attachmentContainerElement = document.createElement('div');
    attachmentContainerElement.id = 'file-attachment-container';
    return attachmentContainerElement;
  }

  private toggleContainerDisplay(display: boolean) {
    this.containerElementRef.style.display = display ? 'block' : 'none';
  }

  private createContainer(file: File, attachmentElement: HTMLElement) {
    const fileAttachmentElement = document.createElement('div');
    fileAttachmentElement.classList.add('file-attachment');
    fileAttachmentElement.appendChild(attachmentElement);
    fileAttachmentElement.appendChild(this.createRemoveAttachmentButton(file, fileAttachmentElement));
    return fileAttachmentElement;
  }

  private createRemoveAttachmentButton(file: File, imageAttachmentElement: HTMLElement) {
    const removeImageButtonELement = document.createElement('div');
    removeImageButtonELement.classList.add('remove-file-attachment-button');
    removeImageButtonELement.onclick = this.removeFile.bind(this, file, imageAttachmentElement);
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeImageButtonELement.appendChild(xIcon);
    return removeImageButtonELement;
  }

  getFiles() {
    return Array.from(this._files);
  }

  addImageFile(file: File, fileReader: FileReader) {
    const imageAttachment = FileAttachments.createImageAttachment(fileReader.result as string);
    if (this._files.size >= this.fileLimit) {
      const attachments = this.containerElementRef.children;
      (attachments[attachments.length - 1].children[1] as HTMLElement).click();
      this.containerElementRef.insertBefore(this.createContainer(file, imageAttachment), attachments[0]);
    } else {
      this.containerElementRef.appendChild(this.createContainer(file, imageAttachment));
    }
    this._files.add(file);
    this.toggleContainerDisplay(true);
  }

  private static createImageAttachment(src: string) {
    const image = new Image();
    image.src = src;
    image.classList.add('image-attachment');
    return image;
  }

  private removeFile(file: File, imageAttachmentElement: HTMLElement) {
    this._files.delete(file);
    imageAttachmentElement.remove();
    if (this._files.size === 0) this.toggleContainerDisplay(false);
  }

  removeAllFiles() {
    this._files.clear();
    this.containerElementRef.replaceChildren();
    this.toggleContainerDisplay(false);
  }
}
