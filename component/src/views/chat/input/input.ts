import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './submitButton/submitButton';
import {SpeechInput} from './speechInput/speechInput';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;
  private readonly _submitButton: SubmitButton;

  constructor(messages: Messages, key: string, aiAssistant: AiAssistant) {
    const {inputStyle, defaultInputText, submitButtonStyle, openAI} = aiAssistant;
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const keyboardInput = new KeyboardInput(inputStyle, defaultInputText);
    this._submitButton = new SubmitButton(keyboardInput.inputElementRef, messages, key, submitButtonStyle, openAI);
    keyboardInput.submit = this._submitButton.submitFromInput.bind(this._submitButton);
    aiAssistant.submitUserMessage = this._submitButton.submitUserText.bind(this._submitButton);
    this.addElements(keyboardInput.elementRef, this._submitButton.elementRef);
    if (aiAssistant.speechInput) this.addElements(new SpeechInput().elementRef);
  }

  private addElements(...elements: HTMLElement[]) {
    elements.forEach((element) => this.elementRef.appendChild(element));
  }
}
