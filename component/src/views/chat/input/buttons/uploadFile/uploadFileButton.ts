import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {FileServiceIO} from '../../../../../services/serviceIO';
import {Modal} from '../../fileAttachments/modal/modal';
import {InputButton} from '../inputButton';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class UploadFileButton extends InputButton<Styles> {
  private readonly _inputElement: HTMLInputElement;
  private readonly _fileAttachmentsType: FileAttachmentsType;
  private _openModalOnce?: boolean | undefined;

  // prettier-ignore
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType,
      fileService: FileServiceIO, iconId: string, iconSVGString: string, dropupText?: string) {
    super(UploadFileButton.createButtonElement(), fileService.button?.position, fileService.button, dropupText);
    const innerElements = this.createInnerElements(iconId, iconSVGString, this._customStyles);
    this._inputElement = UploadFileButton.createInputElement(fileService?.files?.acceptedFormats);
    this.addClickEvent(containerElement, fileService);
    this.elementRef.replaceChildren(innerElements.styles);
    this.reapplyStateStyle('styles');
    this._fileAttachmentsType = fileAttachmentsType;
    this._openModalOnce = fileService.files?.infoModal?.openModalOnce === false
      ? undefined : fileService.files?.infoModal?.openModalOnce;
  }

  private createInnerElements(iconId: string, iconSVGString: string, customStyles?: Styles) {
    const baseIcon = UploadFileButton.createSVGIconElement(iconId, iconSVGString);
    return {
      styles: this.createInnerElement(baseIcon, 'styles', customStyles),
    };
  }

  private triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = this.import.bind(this, inputElement);
    inputElement.click();
  }

  private import(inputElement: HTMLInputElement) {
    FileAttachments.addFilesToType(Array.from(inputElement.files || []), [this._fileAttachmentsType]);
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

  private createInnerElement(baseButton: SVGGraphicsElement, state: 'styles', customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || baseButton;
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button', 'upload-file-button');
    return buttonElement;
  }

  private static createSVGIconElement(iconId: string, iconSVGString: string) {
    const svgIconElement = SVGIconUtils.createSVGElement(iconSVGString);
    svgIconElement.id = iconId;
    return svgIconElement;
  }

  private addClickEvent(containerElement: HTMLElement, fileService: FileServiceIO) {
    const closeCallback = this.triggerImportPrompt.bind(this, this._inputElement);
    const openModalFunc = Modal.createTextModalFunc(containerElement, fileService, closeCallback);
    this.elementRef.onclick = this.click.bind(this, openModalFunc);
  }

  private click(openModalFunc?: () => void) {
    if (openModalFunc && (this._openModalOnce === undefined || this._openModalOnce === true)) {
      openModalFunc();
      if (this._openModalOnce === true) this._openModalOnce = false;
    } else {
      this.triggerImportPrompt(this._inputElement);
    }
  }
}
