import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {GenericInputButtonStyles} from '../../../../../types/genericInputButton';
import {UPLOAD_IMAGES_ICON_STRING} from '../../../../../icons/uploadImages';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {ImagesConfig} from '../../../../../services/serviceIO';
import {ButtonStyleEvents} from '../buttonStyleEvents';

type Styles = DefinedButtonStateStyles<GenericInputButtonStyles>;

export class UploadImagesButton extends ButtonStyleEvents<Styles> {
  inputElement: HTMLInputElement;
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachments: FileAttachments;
  private _openModalOnce?: boolean | undefined;

  constructor(fileAttachments: FileAttachments, images: ImagesConfig, openModalFunc?: (callback: () => void) => void) {
    super(UploadImagesButton.createImageElement(), {});
    this._innerElements = UploadImagesButton.createInnerElements(this._customStyles);
    this.inputElement = UploadImagesButton.createInputElement(images?.files?.acceptedFormats);
    this.elementRef.onclick = this.click.bind(this, openModalFunc);
    this.elementRef.replaceChildren(this._innerElements.default);
    this.reapplyStateStyle('default');
    this._fileAttachments = fileAttachments;
    this._openModalOnce = images.files?.infoModal?.openModalOnce;
  }

  private static createInnerElements(customStyles?: Styles) {
    const baseButton = UploadImagesButton.createSVGIconElement();
    return {
      default: UploadImagesButton.createInnerElement(baseButton, 'default', customStyles),
    };
  }

  private triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = this.import.bind(this, inputElement);
    inputElement.click();
  }

  private import(inputElement: HTMLInputElement) {
    this._fileAttachments.addImages(Array.from(inputElement.files || []));
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

  private static createImageElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(UPLOAD_IMAGES_ICON_STRING);
    svgIconElement.id = 'upload-images-icon';
    return svgIconElement;
  }

  private click(openModalFunc?: (callback: () => void) => void) {
    if (openModalFunc && this._openModalOnce) {
      openModalFunc(this.triggerImportPrompt.bind(this, this.inputElement));
      this._openModalOnce = undefined;
    } else {
      this.triggerImportPrompt(this.inputElement);
    }
  }
}
