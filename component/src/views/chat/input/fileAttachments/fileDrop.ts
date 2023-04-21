import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {FileAttachments} from './fileAttachments';

export class FileDrop {
  // prettier-ignore
  public static append(containerElement: HTMLElement, fileAttachments: FileAttachments,
      dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    const fileDropElement = FileDrop.create(dragAndDrop);
    FileDrop.addEvents(fileDropElement, containerElement, fileAttachments, dragAndDrop);
    containerElement.appendChild(fileDropElement);
  }

  private static create(dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    const fileDropElement = document.createElement('div');
    fileDropElement.id = 'file-drop';
    if (typeof dragAndDrop === 'object' && dragAndDrop.style) Object.assign(fileDropElement.style, dragAndDrop.style);
    return fileDropElement;
  }

  // prettier-ignore
  private static addEvents(fileDropElement: HTMLElement, containerElement: HTMLElement, fileAttachments: FileAttachments,
      dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    containerElement.ondragenter = (event) => {
      event.preventDefault();
      FileDrop.display(fileDropElement);
    };
    fileDropElement.ondragleave = (event) => {
      event.preventDefault();
      FileDrop.hide(fileDropElement);
    };
    fileDropElement.ondragover = (event) => {
      event.preventDefault();
    };
    fileDropElement.ondrop = (event) => {
      event.preventDefault();
      FileDrop.uploadFile(fileAttachments, dragAndDrop, event);
      FileDrop.hide(fileDropElement);
    };
  }

  // prettier-ignore
  private static uploadFile(fileAttachments: FileAttachments, dragAndDrop: FileAttachmentsT['dragAndDrop'],
      event: DragEvent) {
    const files = event.dataTransfer?.files;
    if (files) {
      let acceptedTypePrefixes;
      let acceptedFileNamePostfixes;
      if (typeof dragAndDrop === 'object') {
        acceptedTypePrefixes = dragAndDrop.acceptedTypePrefixes;
        acceptedFileNamePostfixes = dragAndDrop.acceptedFileNamePostfixes;
      }
      fileAttachments.addImages(Array.from(files), acceptedTypePrefixes, acceptedFileNamePostfixes);
    }
  }

  private static display(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'block';
  }

  private static hide(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'none';
  }
}
