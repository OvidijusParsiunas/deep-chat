import {PasteUtils} from './pasteUtils';

export class KeyboardInput {
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor() {
    this.elementRef = KeyboardInput.createContainerElement();
    this.inputElementRef = this.createInputElement();
    this.elementRef.appendChild(this.inputElementRef);
  }

  private createInputElement() {
    const inputElement = document.createElement('div');
    inputElement.id = 'keyboard-input';
    inputElement.classList.add('keyboard-input-default');
    inputElement.contentEditable = 'true';
    inputElement.innerText = 'Ask me anything!';
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

  private static createContainerElement() {
    const contentContainerElement = document.createElement('div');
    contentContainerElement.id = 'keyboard-input-container';
    return contentContainerElement;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit?.();
    }
  }
}
