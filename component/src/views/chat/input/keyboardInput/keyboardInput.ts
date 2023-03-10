import {CustomStyle} from '../../../../types/styles';
import {InputStyles} from '../../../../types/input';
import {PasteUtils} from './pasteUtils';

export class KeyboardInput {
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor(inputStyles?: InputStyles) {
    this.elementRef = KeyboardInput.createContainerElement(inputStyles?.container);
    this.inputElementRef = this.createInputElement(inputStyles?.text, inputStyles?.placeholderText);
    this.elementRef.appendChild(this.inputElementRef);
  }

  private createInputElement(textStyle?: CustomStyle, placeholderInputText?: string) {
    const inputElement = document.createElement('div');
    inputElement.id = 'keyboard-input';
    inputElement.classList.add('keyboard-input-placeholder');
    inputElement.contentEditable = 'true';
    inputElement.innerText = placeholderInputText || 'Ask me anything!';
    inputElement.onfocus = this.onFocus.bind(this);
    inputElement.onkeydown = this.onKeydown.bind(this);
    inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    Object.assign(inputElement.style, textStyle);
    return inputElement;
  }

  public static removeTextIfPlaceholder(inputElement: HTMLElement) {
    if (inputElement.classList.contains('keyboard-input-placeholder')) {
      inputElement.textContent = '';
      inputElement.classList.remove('keyboard-input-placeholder');
    }
  }

  public static toggleEditability(inputElement: HTMLElement, isEditable: boolean) {
    inputElement.contentEditable = isEditable ? 'true' : 'false';
  }

  private onFocus() {
    KeyboardInput.removeTextIfPlaceholder(this.inputElementRef);
  }

  private static createContainerElement(containerStyle?: CustomStyle) {
    const contentContainerElement = document.createElement('div');
    contentContainerElement.id = 'keyboard-input-container';
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
