import {CustomStyle} from '../../../../../types/styles';
import {FileAttachments} from '../fileAttachments';

export class DragAndDrop {
  public static create(containerElement: HTMLElement, fileAttachments: FileAttachments, dnd?: boolean | CustomStyle) {
    const fileDropElement = DragAndDrop.createElement(dnd);
    DragAndDrop.addEvents(fileDropElement, containerElement, fileAttachments);
    containerElement.appendChild(fileDropElement);
  }

  private static createElement(dnd?: boolean | CustomStyle) {
    const fileDropElement = document.createElement('div');
    fileDropElement.id = 'drag-and-drop';
    if (typeof dnd === 'object') Object.assign(fileDropElement.style, dnd);
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
    if (files) fileAttachments.addFilesToAnyType(Array.from(files));
  }

  private static display(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'block';
  }

  private static hide(fileDropElement: HTMLElement) {
    fileDropElement.style.display = 'none';
  }

  public static isEnabled(fileAttachments: FileAttachments, dragAndDrop?: boolean | CustomStyle) {
    if (dragAndDrop !== undefined && dragAndDrop === false) return false;
    return !!dragAndDrop || fileAttachments.getNumberOfTypes() > 0;
  }
}
