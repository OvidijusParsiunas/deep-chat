import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {Browser} from '../../../../utils/browser/browser';
import {ServiceIO} from '../../../../services/serviceIO';
import {TextInput} from '../../../../types/textInput';
import {CustomStyle} from '../../../../types/styles';
import {TextInputEvents} from './textInputEvents';
import {DeepChat} from '../../../../deepChat';
import {PasteUtils} from './pasteUtils';

// TO-DO state for focused (like input)
export class TextInputEl {
  public static TEXT_INPUT_ID = 'text-input';
  public static PLACEHOLDER_TEXT_CLASS = 'text-input-placeholder';
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  private readonly _config: TextInput;
  submit?: () => void;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, fileAts: FileAttachments) {
    const processedConfig = TextInputEl.processConfig(serviceIO, deepChat.textInput);
    this.elementRef = TextInputEl.createContainerElement(processedConfig?.styles?.container);
    this.inputElementRef = this.createInputElement(processedConfig);
    this._config = processedConfig;
    this.elementRef.appendChild(this.inputElementRef);
    deepChat.setPlaceholderText = this.setPlaceholderText.bind(this, deepChat);
    deepChat.setPlaceholderText(deepChat.textInput?.placeholder?.text || 'Ask me anything!');
    setTimeout(() => {
      // in a timeout as deepChat._validationHandler initialised later
      TextInputEvents.add(this.inputElementRef, fileAts, deepChat.textInput?.characterLimit, deepChat._validationHandler);
    });
  }

  private static processConfig(serviceIO: ServiceIO, textInput?: TextInput) {
    textInput ??= {};
    textInput.disabled ??= serviceIO.isTextInputDisabled;
    textInput.placeholder ??= {};
    textInput.placeholder.text ??= serviceIO.textInputPlaceholderText;
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
    inputElement.classList.add('text-input-styling', TextInputEl.PLACEHOLDER_TEXT_CLASS);
    if (Browser.IS_CHROMIUM) TextInputEl.preventAutomaticScrollUpOnNewLine(inputElement);
    if (typeof textInput?.disabled === 'boolean' && textInput.disabled === true) {
      inputElement.contentEditable = 'false';
      inputElement.classList.add('text-input-disabled');
    } else {
      inputElement.contentEditable = 'true';
      this.addEventListeners(inputElement, textInput);
    }
    Object.assign(inputElement.style, textInput?.styles?.text);
    Object.assign(inputElement.style, textInput?.placeholder?.style);
    return inputElement;
  }

  public removeTextIfPlaceholder() {
    if (
      this.inputElementRef.classList.contains(TextInputEl.PLACEHOLDER_TEXT_CLASS) &&
      !this.inputElementRef.classList.contains('text-input-disabled')
    ) {
      if (this._config.placeholder?.style) {
        StyleUtils.unsetStyle(this.inputElementRef, this._config.placeholder?.style);
        Object.assign(this.inputElementRef.style, this._config?.styles?.text);
      }
      TextInputEl.clear(this.inputElementRef);
      this.inputElementRef.classList.remove(TextInputEl.PLACEHOLDER_TEXT_CLASS);
    }
  }

  public static toggleEditability(inputElement: HTMLElement, isEditable: boolean) {
    inputElement.contentEditable = isEditable ? 'true' : 'false';
  }

  private addEventListeners(inputElement: HTMLElement, textInput?: TextInput) {
    inputElement.onfocus = this.onFocus.bind(this, textInput?.styles?.focus);
    if (textInput?.styles?.focus) {
      inputElement.onblur = this.onBlur.bind(this, textInput.styles.focus, textInput?.styles?.container);
    }
    inputElement.addEventListener('keydown', this.onKeydown.bind(this));
    inputElement.addEventListener('paste', PasteUtils.sanitizePastedTextContent);
  }

  private onFocus(focusStyle?: CustomStyle) {
    if (Browser.IS_SAFARI) {
      // timeout used for a bug fix where the user clicks on placeholder text but cursor will not be there
      setTimeout(() => {
        this.removeTextIfPlaceholder();
      });
    } else {
      this.removeTextIfPlaceholder();
    }
    Object.assign(this.elementRef.style, focusStyle);
  }

  private onBlur(focusStyle: CustomStyle, containerStyle?: CustomStyle) {
    StyleUtils.unsetStyle(this.elementRef, focusStyle);
    if (containerStyle) Object.assign(this.elementRef.style, containerStyle);
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

  private setPlaceholderText(deepChat: DeepChat, text: string) {
    if (document.activeElement === deepChat) return;
    if (this.inputElementRef.textContent === '') {
      this.inputElementRef.classList.add(TextInputEl.PLACEHOLDER_TEXT_CLASS);
    }
    if (this.inputElementRef.classList.contains(TextInputEl.PLACEHOLDER_TEXT_CLASS)) {
      this.inputElementRef.textContent = text;
    }
  }
}
