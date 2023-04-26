import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {ButtonPosition as ButtonPositionT} from '../../../../../types/button';
import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentsType';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {AUDIO_ICON_STRING} from '../../../../../icons/audioIcon';
import {CameraModal} from '../../fileAttachments/cameraModal';
import {ServiceIO} from '../../../../../services/serviceIO';
import {ButtonStyleEvents} from '../buttonStyleEvents';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class CameraButton extends ButtonStyleEvents<Styles> {
  readonly position: ButtonPositionT = 'outside-left';

  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType, fileService: ServiceIO['camera']) {
    super(CameraButton.createButtonElement(), fileService?.button || {});
    const innerElements = CameraButton.createInnerElements(this._customStyles);
    if (fileService) {
      if (fileService.button?.position) this.position = fileService.button.position;
      this.addClickEvent(containerElement, fileAttachmentsType);
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
    const svgIconElement = SVGIconUtils.createSVGElement(AUDIO_ICON_STRING);
    svgIconElement.id = 'upload-audio-icon';
    return svgIconElement;
  }

  private addClickEvent(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType) {
    const openModalFunc = CameraModal.createCameraModalFunc(containerElement, fileAttachmentsType);
    this.elementRef.onclick = openModalFunc.bind(this);
  }
}
