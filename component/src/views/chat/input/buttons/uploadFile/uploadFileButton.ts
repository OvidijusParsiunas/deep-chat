import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {ButtonPosition as ButtonPositionT} from '../../../../../types/button';
import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentsType';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {FileServiceIO} from '../../../../../services/serviceIO';
import {ButtonStyleEvents} from '../buttonStyleEvents';
import {Modal} from '../../fileAttachments/modal';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class UploadFileButton extends ButtonStyleEvents<Styles> {
  readonly position: ButtonPositionT = 'outside-left';
  private readonly _inputElement: HTMLInputElement;
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachmentsType: FileAttachmentsType;
  private _openModalOnce?: boolean | undefined;

  // prettier-ignore
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType,
      fileService: FileServiceIO, iconId: string, iconSVGString: string) {
    super(UploadFileButton.createButtonElement(), typeof fileService.button === 'object' ? fileService.button : {});
    this._innerElements = UploadFileButton.createInnerElements(iconId, iconSVGString, this._customStyles);
    this._inputElement = UploadFileButton.createInputElement(fileService?.files?.acceptedFormats);
    if (fileService.button?.position) this.position = fileService.button.position;
    const openModalFunc = Modal.getOpenModalFunc(containerElement, fileService);
    this.elementRef.onclick = this.click.bind(this, openModalFunc);
    this.elementRef.replaceChildren(this._innerElements.default);
    this.reapplyStateStyle('default');
    this._fileAttachmentsType = fileAttachmentsType;
    this._openModalOnce = fileService.files?.infoModal?.openModalOnce;
  }

  private static createInnerElements(iconId: string, iconSVGString: string, customStyles?: Styles) {
    const baseButton = UploadFileButton.createSVGIconElement(iconId, iconSVGString);
    return {
      default: UploadFileButton.createInnerElement(baseButton, 'default', customStyles),
    };
  }

  private triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = this.import.bind(this, inputElement);
    inputElement.click();
  }

  private import(inputElement: HTMLInputElement) {
    FileAttachments.addFiles(Array.from(inputElement.files || []), [this._fileAttachmentsType], false);
    inputElement.value = '';
  }

  private static createInputElement(acceptedFormats?: string) {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = acceptedFormats || '';
    inputElement.hidden = true;
    inputElement.multiple = true;
    return inputElement;
  }

  // prettier-ignore
  private static createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof UploadFileButton['_innerElements'], customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, '', customStyles) || baseButton;
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSVGIconElement(iconId: string, iconSVGString: string) {
    const svgIconElement = SVGIconUtils.createSVGElement(iconSVGString);
    svgIconElement.id = iconId;
    return svgIconElement;
  }

  private click(openModalFunc?: (callback: () => void) => void) {
    if (openModalFunc && this._openModalOnce) {
      openModalFunc(this.triggerImportPrompt.bind(this, this._inputElement));
      this._openModalOnce = undefined;
    } else {
      this.triggerImportPrompt(this._inputElement);
    }
  }
}
