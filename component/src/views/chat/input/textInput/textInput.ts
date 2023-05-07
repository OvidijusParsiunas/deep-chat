import {TextInputStyles} from '../../../../types/textInput';
import {ServiceIO} from '../../../../services/serviceIO';
import {CustomStyle} from '../../../../types/styles';
import {PasteUtils} from './pasteUtils';
import {InputLimit} from './inputLimit';

export class TextInput {
  public static TEXT_INPUT_ID = 'text-input';
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor(serviceIO: ServiceIO, textInputStyles?: TextInputStyles, inputCharacterLimit?: number) {
    const processedTextInputStyles = TextInput.processStyles(serviceIO, textInputStyles);
    this.elementRef = TextInput.createContainerElement(processedTextInputStyles?.container);
    this.inputElementRef = this.createInputElement(processedTextInputStyles);
    this.elementRef.appendChild(this.inputElementRef);
    if (typeof inputCharacterLimit === 'number' && inputCharacterLimit > 0) {
      InputLimit.add(this.inputElementRef, inputCharacterLimit);
    }
  }

  private static processStyles(serviceIO: ServiceIO, textInputStyles?: TextInputStyles) {
    textInputStyles ??= {};
    textInputStyles.placeholderText ??= serviceIO.placeholderText;
    textInputStyles.disabled ??= serviceIO.isTextInputDisabled;
    return textInputStyles;
  }

  private createInputElement(textInputStyles?: TextInputStyles) {
    const inputElement = document.createElement('div');
    inputElement.id = TextInput.TEXT_INPUT_ID;
    inputElement.classList.add('text-input-placeholder');
    inputElement.innerText = textInputStyles?.placeholderText || 'Ask me anything!';
    if (typeof textInputStyles?.disabled === 'boolean' && textInputStyles.disabled === true) {
      inputElement.contentEditable = 'false';
      inputElement.classList.add('text-input-disabled');
    } else {
      inputElement.contentEditable = 'true';
      inputElement.onfocus = this.onFocus.bind(this);
      inputElement.onkeydown = this.onKeydown.bind(this);
      inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    }
    Object.assign(inputElement.style, textInputStyles?.disabled);
    return inputElement;
  }

  public static removeTextIfPlaceholder(inputElement: HTMLElement) {
    if (inputElement.classList.contains('text-input-placeholder')) {
      inputElement.textContent = '';
      inputElement.classList.remove('text-input-placeholder');
    }
  }

  public static toggleEditability(inputElement: HTMLElement, isEditable: boolean) {
    inputElement.contentEditable = isEditable ? 'true' : 'false';
  }

  private onFocus() {
    TextInput.removeTextIfPlaceholder(this.inputElementRef);
  }

  private static createContainerElement(containerStyle?: CustomStyle) {
    const contentContainerElement = document.createElement('div');
    contentContainerElement.id = 'text-input-container';
    Object.assign(contentContainerElement.style, containerStyle);
    return contentContainerElement;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit?.();
    }
  }
}
