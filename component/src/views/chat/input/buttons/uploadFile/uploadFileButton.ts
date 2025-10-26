import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../../utils/consts/htmlConstants';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {FILE, FILES, TEXT} from '../../../../../utils/consts/messageConstants';
import {DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {CLICK} from '../../../../../utils/consts/inputConstants';
import {FileServiceIO} from '../../../../../services/serviceIO';
import {ButtonPosition} from '../../../../../types/button';
import {Legacy} from '../../../../../utils/legacy/legacy';
import {Modal} from '../../fileAttachments/modal/modal';
import {TooltipUtils} from '../tooltip/tooltipUtils';
import {InputButton} from '../inputButton';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class UploadFileButton extends InputButton<Styles> {
  private readonly _inputElement: HTMLInputElement;
  private readonly _fileAttachmentsType: FileAttachmentsType;
  private _openModalOnce?: boolean | undefined;

  // prettier-ignore
  constructor(containerElement: HTMLElement, fileAttachmentsType: FileAttachmentsType,
      fileService: FileServiceIO, iconId: string, iconSVGString: string, dropupText?: string) {
    const buttonPosition = Legacy.processPosition<ButtonPosition>(fileService?.button?.position);
    const dropupItemText = fileService?.button?.styles?.[TEXT]?.content || dropupText;
    const tooltip = TooltipUtils.tryCreateConfig('Upload File', fileService?.button?.tooltip);
    super(
      UploadFileButton.createButtonElement(), iconSVGString, buttonPosition,
      tooltip, fileService.button, dropupItemText);
    const innerElements = this.createInnerElementsForStates(iconId, this.customStyles);
    this._inputElement = UploadFileButton.createInputElement(fileService?.[FILES]?.acceptedFormats);
    this.addClickEvent(containerElement, fileService);
    this.changeElementsByState(innerElements.styles);
    this.reapplyStateStyle('styles');
    this._fileAttachmentsType = fileAttachmentsType;
    this._openModalOnce = fileService[FILES]?.infoModal?.openModalOnce === false
      ? undefined : fileService[FILES]?.infoModal?.openModalOnce;
  }

  private createInnerElementsForStates(iconId: string, customStyles?: Styles) {
    return {
      styles: this.createInnerElements(iconId, 'styles', customStyles),
    };
  }

  private triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = this.import.bind(this, inputElement);
    inputElement[CLICK]();
  }

  private import(inputElement: HTMLInputElement) {
    FileAttachments.addFilesToType(Array.from(inputElement[FILES] || []), [this._fileAttachmentsType]);
    inputElement.value = '';
  }

  private static createInputElement(acceptedFormats?: string) {
    const inputElement = CREATE_ELEMENT('input') as HTMLInputElement;
    inputElement.type = FILE;
    inputElement.accept = acceptedFormats || '';
    inputElement.hidden = true;
    inputElement.multiple = true;
    return inputElement;
  }

  private static createButtonElement() {
    const buttonElement = CREATE_ELEMENT();
    buttonElement[CLASS_LIST].add('input-button');
    return buttonElement;
  }

  private addClickEvent(containerElement: HTMLElement, fileService: FileServiceIO) {
    const closeCallback = this.triggerImportPrompt.bind(this, this._inputElement);
    const openModalFunc = Modal.createTextModalFunc(containerElement, fileService, closeCallback);
    this.elementRef.onclick = this[CLICK].bind(this, openModalFunc);
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
