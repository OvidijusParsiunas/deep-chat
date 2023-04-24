import {ServiceFileTypes, ServiceIO} from '../../../../services/serviceIO';
import {CustomStyle} from '../../../../types/styles';
import {FileAttachments} from './fileAttachments';

export class DragAndDrop {
  // prettier-ignore
  public static attemptToAdd(containerElement: HTMLElement, fileAttachments: FileAttachments, serviceIO: ServiceIO,
      style?: CustomStyle) {
    if (!DragAndDrop.shouldBeAppended(serviceIO)) return;
    const fileDropElement = DragAndDrop.create(style);
    DragAndDrop.addEvents(fileDropElement, containerElement, fileAttachments);
    containerElement.appendChild(fileDropElement);
  }

  private static create(style?: CustomStyle) {
    const fileDropElement = document.createElement('div');
    fileDropElement.id = 'drag-and-drop';
    Object.assign(fileDropElement.style, style);
    return fileDropElement;
  }

  private static addEvents(fileDropElement: HTMLElement, containerElement: HTMLElement, fileAttachments: FileAttachments) {
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
      DragAndDrop.uploadFile(fileAttachments, event);
      DragAndDrop.hide(fileDropElement);
    };
  }

  private static uploadFile(fileAttachments: FileAttachments, event: DragEvent) {
    const files = event.dataTransfer?.files;
    if (files) fileAttachments.addFiles(Array.from(files), true);
  }

  private static display(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'block';
  }

  private static hide(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'none';
  }

  private static shouldBeAppended(serviceIO: ServiceIO) {
    const fileTypes = serviceIO.fileTypes || {};
    return Object.keys(fileTypes).find((key) => fileTypes[key as keyof ServiceFileTypes]?.files?.dragAndDrop);
  }
}
