import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CameraModal} from '../../fileAttachments/modal/cameraModal';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {CAMERA_ICON_STRING} from '../../../../../icons/cameraIcon';
import {ServiceIO} from '../../../../../services/serviceIO';
import {ButtonInnerElements} from '../buttonInnerElements';
import {CameraFiles} from '../../../../../types/camera';
import {CustomStyle} from '../../../../../types/styles';
import {InputButton} from '../inputButton';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class CameraButton extends InputButton<Styles> {
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType, fileService: ServiceIO['camera']) {
    const buttonPosition = fileService?.button?.position;
    const dropupText = fileService?.button?.styles?.text?.content || 'Photo';
    const svg = CameraButton.createSVGIconElement();
    super(CameraButton.createButtonElement(), svg, buttonPosition, fileService?.button || {}, dropupText);
    const innerElements = this.createInnerElements(this.customStyles, buttonPosition === 'dropup-menu');
    if (fileService) {
      this.addClickEvent(containerElement, fileAttachmentsType, fileService.modalContainerStyle, fileService.files);
    }
    this.elementRef.classList.add('upload-file-button');
    this.elementRef.replaceChildren(...innerElements.styles);
    this.reapplyStateStyle('styles');
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(CAMERA_ICON_STRING);
    svgIconElement.id = 'camera-icon';
    return svgIconElement;
  }

  private createInnerElements(customStyles?: Styles, isDropup = false) {
    return {
      styles: ButtonInnerElements.createInnerElements(this.elementRef, this.svg, 'styles', customStyles, isDropup),
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
