import {FileAttachments as FileAttachmentsT} from '../../../../types/fileAttachments';
import {FileAttachments} from './fileAttachments';

export class DragAndDrop {
  // prettier-ignore
  public static append(containerElement: HTMLElement, fileAttachments: FileAttachments,
      dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    const fileDropElement = DragAndDrop.create(dragAndDrop);
    DragAndDrop.addEvents(fileDropElement, containerElement, fileAttachments, dragAndDrop);
    containerElement.appendChild(fileDropElement);
  }

  private static create(dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    const fileDropElement = document.createElement('div');
    fileDropElement.id = 'drag-and-drop';
    if (typeof dragAndDrop === 'object' && dragAndDrop.style) Object.assign(fileDropElement.style, dragAndDrop.style);
    return fileDropElement;
  }

  // prettier-ignore
  private static addEvents(fileDropElement: HTMLElement, containerElement: HTMLElement, fileAttachments: FileAttachments,
      dragAndDrop: FileAttachmentsT['dragAndDrop']) {
    containerElement.ondragenter = (event) => {
      event.preventDefault();
      DragAndDrop.display(fileDropElement);
    };
    fileDropElement.ondragleave = (event) => {
      event.preventDefault();
      DragAndDrop.hide(fileDropElement);
    };
    fileDropElement.ondragover = (event) => {
      event.preventDefault();
    };
    fileDropElement.ondrop = (event) => {
      event.preventDefault();
      DragAndDrop.uploadFile(fileAttachments, dragAndDrop, event);
      DragAndDrop.hide(fileDropElement);
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
