import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {UploadImagesModal} from '../../uploadImages/uploadImagesModal';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {MicrophoneStyles} from '../../../../../types/speechInput';
import {ButtonStyleEvents} from '../buttonStyleEvents';

type Styles = DefinedButtonStateStyles<MicrophoneStyles>;

export class UploadImagesButton extends ButtonStyleEvents<Styles> {
  inputElement: HTMLInputElement;
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachments: FileAttachments;
  private _hasModalBeenDisplayed = false;

  constructor(fileAttachments: FileAttachments, uploadImagesModal: UploadImagesModal, acceptedFormats?: string) {
    super(UploadImagesButton.createMicrophoneElement(), {});
    this._innerElements = UploadImagesButton.createInnerElements(this._customStyles);
    this.inputElement = UploadImagesButton.createInputElement(acceptedFormats);
    this.elementRef.onclick = this.click.bind(this, uploadImagesModal);
    this.changeToDefault();
    this._fileAttachments = fileAttachments;
  }

  private static createInnerElements(customStyles?: Styles) {
    const baseButton = UploadImagesButton.createSVGIconElement();
    return {
      default: UploadImagesButton.createInnerElement(baseButton, 'default', customStyles),
      active: UploadImagesButton.createInnerElement(baseButton, 'active', customStyles),
      unsupported: UploadImagesButton.createInnerElement(baseButton, 'unsupported', customStyles),
    };
  }

  private triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = this.import.bind(this, inputElement);
    inputElement.click();
  }

  private import(inputElement: HTMLInputElement) {
    Array.from(inputElement.files || [])
      .slice(0, this._fileAttachments.fileLimit)
      .forEach((file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          this._fileAttachments.addImageFile(file, event.target as FileReader);
        };
      });

    inputElement.value = '';
  }

  private static createInputElement(acceptedFormats?: string) {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = acceptedFormats || 'image/*';
    inputElement.hidden = true;
    inputElement.multiple = true;
    return inputElement;
  }

  // prettier-ignore
  private static createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof UploadImagesButton['_innerElements'], customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, 'image-icon', customStyles) || baseButton;
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone-button';
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    return svgIconElement;
  }

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.toggleIconFilter(false);
    this.reapplyStateStyle('active', ['default']);
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    this.toggleIconFilter(true);
    this.reapplyStateStyle('default', ['active']);
  }

  private changeToUnsupported() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.elementRef.classList.add('unsupported-microphone');
    this.reapplyStateStyle('unsupported', ['active']);
  }

  private toggleIconFilter(isDefault: boolean) {
    const iconElement = this.elementRef.children[0];
    if (iconElement.tagName.toLocaleLowerCase() === 'svg') {
      if (isDefault) {
        iconElement.classList.remove('active-microphone-icon');
        iconElement.classList.add('default-microphone-icon');
      } else {
        iconElement.classList.replace('default-microphone-icon', 'active-microphone-icon');
      }
    }
  }

  private click(uploadImagesModal: UploadImagesModal) {
    if (!this._hasModalBeenDisplayed) {
      uploadImagesModal.open(this.triggerImportPrompt.bind(this, this.inputElement));
      this._hasModalBeenDisplayed = true;
    } else {
      this.triggerImportPrompt(this.inputElement);
    }
  }
}
