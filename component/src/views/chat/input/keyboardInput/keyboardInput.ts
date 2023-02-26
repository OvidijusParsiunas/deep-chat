import {PasteUtils} from './pasteUtils';

export class KeyboardInput {
  readonly elementRef: HTMLElement;
  readonly inputElementRef: HTMLElement;
  submit?: () => void;

  constructor() {
    const containerElement = KeyboardInput.createContainerElement();
    const inputElement = this.createInputElement();
    this.inputElementRef = inputElement;
    containerElement.appendChild(inputElement);
    this.elementRef = containerElement;
  }

  private createInputElement() {
    const inputElement = document.createElement('div');
    inputElement.id = 'keyboard-input';
    inputElement.contentEditable = 'true';
    inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    inputElement.onkeydown = this.onKeydown.bind(this);
    return inputElement;
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
