export class ImageAttachments {
  private readonly _files: Set<File> = new Set();
  private readonly containerElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement) {
    this.containerElementRef = this.createAttachmentContainer();
    inputElementRef.appendChild(this.containerElementRef);
  }

  addImageFile(file: File, fileReader: FileReader) {
    this._files.add(file);
    this.containerElementRef.appendChild(this.createContainer(file, fileReader.result as string));
    this.containerElementRef.classList.add('image-attachment-container-background');
  }

  private createAttachmentContainer() {
    const attachmentContainerElement = document.createElement('div');
    attachmentContainerElement.id = 'image-attachment-container';
    return attachmentContainerElement;
  }

  private createContainer(file: File, src: string) {
    const image = new Image();
    image.src = src;
    image.classList.add('image-attachment-src');
    const imageAttachmentElement = document.createElement('div');
    imageAttachmentElement.classList.add('image-attachment');
    imageAttachmentElement.appendChild(image);
    imageAttachmentElement.appendChild(this.createRemoveAttachmentButton(file, imageAttachmentElement));
    return imageAttachmentElement;
  }

  private createRemoveAttachmentButton(file: File, imageAttachmentElement: HTMLElement) {
    const removeImageButtonELement = document.createElement('div');
    removeImageButtonELement.classList.add('remove-image-attachment-button');
    removeImageButtonELement.onclick = this.removeFile.bind(this, file, imageAttachmentElement);
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeImageButtonELement.appendChild(xIcon);
    return removeImageButtonELement;
  }

  private removeFile(file: File, imageAttachmentElement: HTMLElement) {
    this._files.delete(file);
    imageAttachmentElement.remove();
    if (this._files.size === 0) this.containerElementRef.classList.remove('image-attachment-container-background');
  }

  getFiles() {
    return Array.from(this._files);
  }

  removeAllFiles() {
    this._files.clear();
    this.containerElementRef.replaceChildren();
    this.containerElementRef.classList.remove('image-attachment-container-background');
  }
}
