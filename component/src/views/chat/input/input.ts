import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './submitButton/submitButton';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;
  private readonly _button: SubmitButton;

  constructor(key: string, messages: Messages) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const inputElement = new KeyboardInput();
    this._button = new SubmitButton(inputElement.inputElementRef, key, messages);
    inputElement.submit = this._button.submit.bind(this._button);
    this.addElements(inputElement.elementRef, this._button.elementRef);
  }

  private addElements(inputElement: HTMLElement, buttonElement: HTMLElement) {
    this.elementRef.appendChild(inputElement);
    this.elementRef.appendChild(buttonElement);
  }
}
