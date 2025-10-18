import {CREATE_ELEMENT, STYLE} from '../../../../../utils/consts/htmlConstants';
import {OBJECT} from '../../../../../services/utils/serviceConstants';
import {FILES} from '../../../../../utils/consts/messageConstants';
import {CustomStyle} from '../../../../../types/styles';
import {FileAttachments} from '../fileAttachments';

export class DragAndDrop {
  public static create(containerElement: HTMLElement, fileAttachments: FileAttachments, dnd?: boolean | CustomStyle) {
    const fileDropElement = DragAndDrop.createElement(dnd);
    DragAndDrop.addEvents(fileDropElement, containerElement, fileAttachments);
    containerElement.appendChild(fileDropElement);
  }

  private static createElement(dnd?: boolean | CustomStyle) {
    const fileDropElement = CREATE_ELEMENT();
    fileDropElement.id = 'drag-and-drop';
    if (typeof dnd === OBJECT) Object.assign(fileDropElement[STYLE], dnd);
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
    const files = event.dataTransfer?.[FILES];
    if (files) fileAttachments.addFilesToAnyType(Array.from(files));
  }

  private static display(fileDropElement: HTMLElement) {
    fileDropElement[STYLE].display = 'block';
  }

  private static hide(fileDropElement: HTMLElement) {
    fileDropElement[STYLE].display = 'none';
  }

  public static isEnabled(fileAttachments: FileAttachments, dragAndDrop?: boolean | CustomStyle) {
    if (dragAndDrop !== undefined && dragAndDrop === false) return false;
    return !!dragAndDrop || fileAttachments.getNumberOfTypes() > 0;
  }
}
