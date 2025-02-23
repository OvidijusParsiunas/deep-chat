import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {CameraModal} from '../../fileAttachments/modal/cameraModal';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
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
    super(CameraButton.createButtonElement(), buttonPosition, fileService?.button || {}, dropupText);
    const innerElements = this.createInnerElements(this._customStyles, buttonPosition === 'dropup-menu');
    if (fileService) {
      this.addClickEvent(containerElement, fileAttachmentsType, fileService.modalContainerStyle, fileService.files);
    }
    this.elementRef.classList.add('upload-file-button');
    this.elementRef.appendChild(innerElements.styles);
    this.reapplyStateStyle('styles');
  }

  // prettier-ignore
  private createInnerElements(customStyles?: Styles, isDropup = false) {
    return {
      styles: CustomButtonInnerElements.createInnerElement(
        this.elementRef, CameraButton.createSVGIconElement(), 'styles', customStyles, isDropup),
    };
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(CAMERA_ICON_STRING);
    svgIconElement.id = 'camera-icon';
    return svgIconElement;
  }

  // prettier-ignore
  private addClickEvent(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType,
      modalContainerStyle?: CustomStyle, cameraFiles?: CameraFiles) {
    const openModalFunc = CameraModal.createCameraModalFunc(
      containerElement, fileAttachmentsType, modalContainerStyle, cameraFiles);
    this.elementRef.onclick = openModalFunc;
  }
}
