import {CustomStyle} from '../../../../types/styles';
import {PasteUtils} from './pasteUtils';

export class KeyboardInput {
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor(inputStyle?: CustomStyle, defaultInputText?: string) {
    this.elementRef = KeyboardInput.createContainerElement(inputStyle);
    this.inputElementRef = this.createInputElement(defaultInputText);
    this.elementRef.appendChild(this.inputElementRef);
  }

  private createInputElement(defaultInputText?: string) {
    const inputElement = document.createElement('div');
    inputElement.id = 'keyboard-input';
    inputElement.classList.add('keyboard-input-default');
    inputElement.contentEditable = 'true';
    inputElement.innerText = defaultInputText || 'Ask me anything!';
    inputElement.onfocus = this.onFocus.bind(this);
    inputElement.onkeydown = this.onKeydown.bind(this);
    inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    return inputElement;
  }

  private onFocus() {
    if (this.inputElementRef.classList.contains('keyboard-input-default')) {
      this.inputElementRef.textContent = '';
      this.inputElementRef.classList.remove('keyboard-input-default');
    }
  }

  private static createContainerElement(inputStyle?: CustomStyle) {
    const contentContainerElement = document.createElement('div');
    contentContainerElement.id = 'keyboard-input-container';
    Object.assign(contentContainerElement.style, inputStyle);
    return contentContainerElement;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit?.();
    }
  }
}
