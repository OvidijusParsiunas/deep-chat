import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {Browser} from '../../../../utils/browser/browser';
import {ServiceIO} from '../../../../services/serviceIO';
import {TextInput} from '../../../../types/textInput';
import {CustomStyle} from '../../../../types/styles';
import {PasteUtils} from './pasteUtils';
import {InputLimit} from './inputLimit';

// WORK - Safari issue where initial text not selected
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

  // this is is a bug fix where if the browser is scrolled down and the user types in text that creates new line
  // the browser scrollbar will move up which leads to undesirable UX.
  // More details in this Stack Overflow question:
  // https://stackoverflow.com/questions/76285135/prevent-automatic-scroll-when-text-is-inserted-into-contenteditable-div
  // prettier-ignore
  private static preventAutomaticScrollUpOnNewLine(inputElement: HTMLDivElement) {
    let scrollY: number | undefined;
    inputElement.addEventListener('keydown', () => {scrollY = window.scrollY;});
    inputElement.addEventListener('input', () => { if (scrollY !== window.scrollY) window.scrollTo({top: scrollY});});
  }

  // this also similarly prevents scroll up
  public static clear(inputElement: HTMLElement) {
    const scrollY = window.scrollY;
    if (!inputElement.classList.contains('text-input-disabled')) inputElement.textContent = '';
    if (Browser.IS_CHROMIUM) window.scrollTo({top: scrollY});
  }

  private createInputElement(textInput?: TextInput) {
    const inputElement = document.createElement('div');
    inputElement.id = TextInputEl.TEXT_INPUT_ID;
    inputElement.classList.add('text-input-placeholder');
    inputElement.innerText = textInput?.placeholderText || 'Ask me anything!';
    if (Browser.IS_CHROMIUM) TextInputEl.preventAutomaticScrollUpOnNewLine(inputElement);
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
      TextInputEl.clear(inputElement);
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
    // ctrlKey && shiftKey allow the creation of a new line
    if (event.key === KEYBOARD_KEY.ENTER && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      this.submit?.();
    }
  }
}
