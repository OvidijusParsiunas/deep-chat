import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {CameraModal} from '../../fileAttachments/modal/cameraModal';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {CAMERA_ICON_STRING} from '../../../../../icons/cameraIcon';
import {CameraFiles} from '../../../../../types/cameraFiles';
import {ServiceIO} from '../../../../../services/serviceIO';
import {CustomStyle} from '../../../../../types/styles';
import {ButtonStyling} from '../buttonStyling';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class CameraButton extends ButtonStyling<Styles> {
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType, fileService: ServiceIO['camera']) {
    const defaultPosition = fileService?.button?.position || 'outside-left';
    super(CameraButton.createButtonElement(), defaultPosition, fileService?.button || {});
    const innerElements = CameraButton.createInnerElements(this._customStyles);
    this.reapplyStateStyle('styles');
    if (fileService) {
      this.addClickEvent(containerElement, fileAttachmentsType, fileService.modalContainerStyle, fileService.files);
    }
    this.elementRef.appendChild(innerElements.styles);
  }

  private static createInnerElements(customStyles?: Styles) {
    return {
      styles: CameraButton.createInnerElement(CameraButton.createSVGIconElement(), 'styles', customStyles),
    };
  }

  private static createInnerElement(baseButton: SVGGraphicsElement, state: 'styles', customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, '', customStyles) || baseButton;
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
