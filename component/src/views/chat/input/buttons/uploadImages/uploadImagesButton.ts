import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {UploadImages as UploadImagesT} from '../../../../../types/uploadImages';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {MicrophoneStyles} from '../../../../../types/speechInput';
import {ServiceIO} from '../../../../../services/serviceIO';
import {ButtonStyleEvents} from '../buttonStyleEvents';

type Styles = DefinedButtonStateStyles<MicrophoneStyles>;

export class UploadImagesButton extends ButtonStyleEvents<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  inputElement: HTMLInputElement;

  constructor(inputElementRef: HTMLElement) {
    super(UploadImagesButton.createMicrophoneElement(), {});
    this._innerElements = UploadImagesButton.createInnerElements(this._customStyles);
    this.inputElement = UploadImagesButton.createInputElement();
    this.elementRef.onclick = UploadImagesButton.triggerImportPrompt.bind(this, this.inputElement);
    this.changeToDefault();
    inputElementRef.appendChild(UploadImagesButton.createAttachmentContainer());
  }

  private static createRemoveAttachmentButton() {
    const removeImageButtonELement = document.createElement('div');
    removeImageButtonELement.classList.add('remove-image-attachment-button');
    const xIcon = document.createElement('div');
    xIcon.classList.add('x-icon');
    xIcon.innerText = '×';
    removeImageButtonELement.appendChild(xIcon);
    return removeImageButtonELement;
  }

  private static createContainer() {
    const image = new Image();
    image.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Fischotter%2C_Lutra_Lutra.JPG';
    image.classList.add('image-attachment-src');
    const imageAttachmentElement = document.createElement('div');
    imageAttachmentElement.classList.add('image-attachment');
    imageAttachmentElement.appendChild(image);
    imageAttachmentElement.appendChild(UploadImagesButton.createRemoveAttachmentButton());
    return imageAttachmentElement;
  }

  private static createAttachmentContainer() {
    const attachmentContainerElement = document.createElement('div');
    attachmentContainerElement.id = 'image-attachment-container';
    attachmentContainerElement.appendChild(UploadImagesButton.createContainer());
    attachmentContainerElement.appendChild(UploadImagesButton.createContainer());
    return attachmentContainerElement;
  }

  private static createInnerElements(customStyles?: Styles) {
    const baseButton = UploadImagesButton.createSVGIconElement();
    return {
      default: UploadImagesButton.createInnerElement(baseButton, 'default', customStyles),
      active: UploadImagesButton.createInnerElement(baseButton, 'active', customStyles),
      unsupported: UploadImagesButton.createInnerElement(baseButton, 'unsupported', customStyles),
    };
  }

  public static triggerImportPrompt(inputElement: HTMLInputElement) {
    inputElement.onchange = UploadImagesButton.import.bind(this, inputElement);
    inputElement.click();
  }

  public static import(inputElement: HTMLInputElement) {
    const reader = new FileReader();
    const file = inputElement.files?.[0] as Blob;
    reader.readAsText(file);
    reader.onload = (event) => {
      console.log(event);
    };
  }

  public static createInputElement() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
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

  public static isAvailable(serviceIO: ServiceIO, uploadImages?: UploadImagesT) {
    if (uploadImages !== undefined) {
      return !!uploadImages;
    }
    return !!serviceIO.allowImages;
  }
}
