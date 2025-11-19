import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../../utils/consts/htmlConstants';
import {BrowserStorage} from '../../messages/browserStorage/browserStorage';
import {FILES, TEXT} from '../../../../utils/consts/messageConstants';
import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {Browser} from '../../../../utils/browser/browser';
import {ServiceIO} from '../../../../services/serviceIO';
import {DefaultInput} from '../../../../types/messages';
import {TextInput} from '../../../../types/textInput';
import {CustomStyle} from '../../../../types/styles';
import {TextInputEvents} from './textInputEvents';
import {DeepChat} from '../../../../deepChat';
import {PasteUtils} from './pasteUtils';
import {FocusUtils} from './focusUtils';

// TO-DO state for focused (like input)
export class TextInputEl {
  public static TEXT_INPUT_ID = 'text-input';
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  private readonly _config: TextInput;
  // detect if using a dropup for text input composition, e.g. hiragana to kanji symbols
  private _isComposing: boolean = false;
  private _onInput: ((isUser: boolean) => void) | undefined;
  private readonly _browserStorage?: BrowserStorage;
  submit?: () => void;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, fileAttachments: FileAttachments, storage?: BrowserStorage) {
    const processedConfig = TextInputEl.processConfig(serviceIO, deepChat.textInput);
    this.elementRef = TextInputEl.createContainerElement(processedConfig?.styles?.container);
    this._config = processedConfig;
    this.inputElementRef = this.createInputElement(deepChat.defaultInput?.[TEXT], storage);
    TextInputEl.addFilesToAnyType(fileAttachments, deepChat.defaultInput?.[FILES]);
    this.elementRef.appendChild(this.inputElementRef);
    deepChat.setPlaceholderText = this.setPlaceholderText.bind(this);
    deepChat.setPlaceholderText(this._config.placeholder?.[TEXT] || 'Ask me anything!');
    this._browserStorage = storage;
    setTimeout(() => {
      // in a timeout as deepChat._validationHandler initialised later
      TextInputEvents.add(this.inputElementRef, fileAttachments, this._config.characterLimit, deepChat._validationHandler);
      this._onInput = serviceIO.onInput;
    });
  }

  private static processConfig(serviceIO: ServiceIO, textInput?: TextInput) {
    textInput ??= {};
    textInput.disabled ??= serviceIO.isTextInputDisabled;
    textInput.placeholder ??= {};
    textInput.placeholder[TEXT] ??= serviceIO.textInputPlaceholderText;
    return textInput;
  }

  private static createContainerElement(containerStyle?: CustomStyle) {
    const contentContainerElement = CREATE_ELEMENT();
    contentContainerElement.id = 'text-input-container';
    Object.assign(contentContainerElement[STYLE], containerStyle);
    return contentContainerElement;
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
  public clear() {
    const scrollY = window.scrollY;
    if (!this.inputElementRef[CLASS_LIST].contains('text-input-disabled')) {
      Object.assign(this.inputElementRef[STYLE], this._config.placeholder?.[STYLE]);
      this.inputElementRef.textContent = '';
      FocusUtils.focusEndOfInput(this.inputElementRef);
      this._onInput?.(false);
      this._browserStorage?.addInputText('');
    }
    if (Browser.IS_CHROMIUM) window.scrollTo({top: scrollY});
  }

  private createInputElement(defaultText?: string, storage?: BrowserStorage) {
    const inputElement = CREATE_ELEMENT() as HTMLDivElement;
    inputElement.id = TextInputEl.TEXT_INPUT_ID;
    inputElement[CLASS_LIST].add('text-input-styling');
    inputElement.role = 'textbox';
    if (typeof defaultText === 'string') {
      inputElement.innerText = defaultText;
    } else if (storage?.trackInputText) {
      inputElement.innerText = storage.get().inputText || '';
    }
    // makes the element focusable on mobile
    // https://github.com/OvidijusParsiunas/deep-chat/pull/452/files/b8cf45dc559be2667e51f8cf2bb026527000076d
    if (Browser.IS_MOBILE) inputElement.setAttribute('tabindex', '0');
    if (Browser.IS_CHROMIUM) TextInputEl.preventAutomaticScrollUpOnNewLine(inputElement);
    if (typeof this._config.disabled === 'boolean' && this._config.disabled === true) {
      inputElement.contentEditable = 'false';
      inputElement[CLASS_LIST].add('text-input-disabled');
      inputElement.setAttribute('aria-disabled', 'true');
    } else {
      inputElement.contentEditable = 'true';
      inputElement.removeAttribute('aria-disabled');
      this.addEventListeners(inputElement);
    }
    Object.assign(inputElement[STYLE], this._config.styles?.[TEXT]);
    Object.assign(inputElement[STYLE], this._config.placeholder?.[STYLE]);
    if (!this._config.placeholder?.[STYLE]?.color) inputElement.setAttribute('textcolor', '');
    return inputElement;
  }

  private static addFilesToAnyType(fileAttachments: FileAttachments, files: DefaultInput['files']) {
    if (files) fileAttachments.addFilesToAnyType(Array.from(files).map((file) => file));
  }

  public removePlaceholderStyle() {
    if (!this.inputElementRef[CLASS_LIST].contains('text-input-disabled') && this._config.placeholder?.[STYLE]) {
      StyleUtils.unsetStyle(this.inputElementRef, this._config.placeholder?.[STYLE]);
      Object.assign(this.inputElementRef[STYLE], this._config?.styles?.[TEXT]);
    }
  }

  private addEventListeners(inputElement: HTMLElement) {
    if (this._config.styles?.focus) {
      inputElement.onfocus = () => Object.assign(this.elementRef[STYLE], this._config.styles?.focus);
      inputElement.onblur = this.onBlur.bind(this, this._config.styles.focus, this._config.styles?.container);
    }
    inputElement.addEventListener('keydown', this.onKeydown.bind(this));
    inputElement.addEventListener('input', this.onInput.bind(this));
    inputElement.addEventListener('paste', PasteUtils.sanitizePastedTextContent);
    inputElement.addEventListener('compositionstart', () => (this._isComposing = true));
    inputElement.addEventListener('compositionend', () => (this._isComposing = false));
  }

  private onBlur(focusStyle: CustomStyle, containerStyle?: CustomStyle) {
    StyleUtils.unsetStyle(this.elementRef, focusStyle);
    if (containerStyle) Object.assign(this.elementRef[STYLE], containerStyle);
  }

  private onKeydown(event: KeyboardEvent) {
    // user needs to click the submit button on mobile as return should be used for a new line
    if (event.key === KEYBOARD_KEY.ENTER && !Browser.IS_MOBILE && !this._isComposing) {
      // ctrlKey && shiftKey allow the creation of a new line
      if (!event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        this.submit?.();
      }
    }
  }

  private onInput() {
    if (!this.isTextInputEmpty()) {
      this.removePlaceholderStyle();
    } else {
      Object.assign(this.inputElementRef[STYLE], this._config.placeholder?.[STYLE]);
    }
    this._onInput?.(true);
  }

  private setPlaceholderText(text: string) {
    this.inputElementRef.setAttribute('deep-chat-placeholder-text', text);
    this.inputElementRef.setAttribute('aria-label', text);
  }

  public isTextInputEmpty() {
    return this.inputElementRef.textContent === '';
  }
}
