import {ServiceIO} from '../../../../services/serviceIO';
import {TextInput} from '../../../../types/textInput';
import {CustomStyle} from '../../../../types/styles';
import {PasteUtils} from './pasteUtils';
import {InputLimit} from './inputLimit';

export class TextInputEl {
  public static TEXT_INPUT_ID = 'text-input';
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor(serviceIO: ServiceIO, textInput?: TextInput) {
    const processedTextInputStyles = TextInputEl.processStyles(serviceIO, textInput);
    this.elementRef = TextInputEl.createContainerElement(processedTextInputStyles?.styles?.container);
    this.inputElementRef = this.createInputElement(processedTextInputStyles);
    this.elementRef.appendChild(this.inputElementRef);
    if (textInput?.characterLimit) InputLimit.add(this.inputElementRef, textInput?.characterLimit);
  }

  private static processStyles(serviceIO: ServiceIO, textInput?: TextInput) {
    textInput ??= {};
    textInput.placeholderText ??= serviceIO.textInputPlaceholderText;
    textInput.disabled ??= serviceIO.isTextInputDisabled;
    return textInput;
  }

  private createInputElement(textInput?: TextInput) {
    const inputElement = document.createElement('div');
    inputElement.id = TextInputEl.TEXT_INPUT_ID;
    inputElement.classList.add('text-input-placeholder');
    inputElement.innerText = textInput?.placeholderText || 'Ask me anything!';
    if (typeof textInput?.disabled === 'boolean' && textInput.disabled === true) {
      inputElement.contentEditable = 'false';
      inputElement.classList.add('text-input-disabled');
    } else {
      inputElement.contentEditable = 'true';
      inputElement.onfocus = this.onFocus.bind(this);
      inputElement.addEventListener('keydown', this.onKeydown.bind(this));
      inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    }
    Object.assign(inputElement.style, textInput?.styles?.text);
    return inputElement;
  }

  public static removeTextIfPlaceholder(inputElement: HTMLElement) {
    if (
      inputElement.classList.contains('text-input-placeholder') &&
      !inputElement.classList.contains('text-input-disabled')
    ) {
      inputElement.textContent = '';
      inputElement.classList.remove('text-input-placeholder');
    }
  }

  public static toggleEditability(inputElement: HTMLElement, isEditable: boolean) {
    inputElement.contentEditable = isEditable ? 'true' : 'false';
  }

  private onFocus() {
    TextInputEl.removeTextIfPlaceholder(this.inputElementRef);
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
