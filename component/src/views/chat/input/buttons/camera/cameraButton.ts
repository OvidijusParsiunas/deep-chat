import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CameraModal} from '../../fileAttachments/modal/cameraModal';
import {CAMERA_ICON_STRING} from '../../../../../icons/cameraIcon';
import {ServiceIO} from '../../../../../services/serviceIO';
import {CameraFiles} from '../../../../../types/camera';
import {CustomStyle} from '../../../../../types/styles';
import {InputButton} from '../inputButton';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class CameraButton extends InputButton<Styles> {
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType, fileService: ServiceIO['camera']) {
    const buttonPosition = fileService?.button?.position;
    const dropupText = fileService?.button?.styles?.text?.content || 'Photo';
    super(CameraButton.createButtonElement(), CAMERA_ICON_STRING, buttonPosition, fileService?.button || {}, dropupText);
    const innerElements = this.createInnerElementsForStates(this.customStyles);
    if (fileService) {
      this.addClickEvent(containerElement, fileAttachmentsType, fileService.modalContainerStyle, fileService.files);
    }
    this.changeElementsByState(innerElements.styles);
    this.reapplyStateStyle('styles');
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    return {
      styles: this.createInnerElements('camera-icon', 'styles', customStyles),
    };
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  // prettier-ignore
  private addClickEvent(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType,
      modalContainerStyle?: CustomStyle, cameraFiles?: CameraFiles) {
    const openModalFunc = CameraModal.createCameraModalFunc(
      containerElement, fileAttachmentsType, modalContainerStyle, cameraFiles);
    this.elementRef.onclick = openModalFunc;
  }
}
