import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {ButtonPosition as ButtonPositionT} from '../../../../../types/button';
import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentsType';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {CAMERA_ICON_STRING} from '../../../../../icons/cameraIcon';
import {CameraModal} from '../../fileAttachments/cameraModal';
import {ServiceIO} from '../../../../../services/serviceIO';
import {CustomStyle} from '../../../../../types/styles';
import {CameraFiles} from '../../../../../types/camera';
import {ButtonStyleEvents} from '../buttonStyleEvents';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class CameraButton extends ButtonStyleEvents<Styles> {
  readonly position: ButtonPositionT = 'outside-left';

  // prettier-ignore
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType, fileService: ServiceIO['camera']) {
    super(CameraButton.createButtonElement(), fileService?.button || {});
    const innerElements = CameraButton.createInnerElements(this._customStyles);
    if (fileService) {
      if (fileService.button?.position) this.position = fileService.button.position;
      this.addClickEvent(
        containerElement, fileAttachmentsType, fileService?.modalContainerStyle, fileService.files);
      this.elementRef.replaceChildren(innerElements.styles);
      this.reapplyStateStyle('styles');
    }
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
    this.elementRef.onclick = openModalFunc.bind(this);
  }
}
