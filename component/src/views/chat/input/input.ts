import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './submitButton/submitButton';
import {SpeechInput} from './speechInput/speechInput';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;
  private readonly _submitButton: SubmitButton;

  constructor(key: string, messages: Messages) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const keyboardInput = new KeyboardInput();
    this._submitButton = new SubmitButton(keyboardInput.inputElementRef, key, messages);
    keyboardInput.submit = this._submitButton.submit.bind(this._submitButton);
    const speechInput = new SpeechInput(keyboardInput.inputElementRef);
    this.addElements(keyboardInput.elementRef, this._submitButton.elementRef, speechInput.elementRef);
  }

  private addElements(...elements: HTMLElement[]) {
    elements.forEach((element) => this.elementRef.appendChild(element));
  }
}
