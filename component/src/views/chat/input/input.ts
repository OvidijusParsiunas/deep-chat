import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './submitButton/submitButton';
import {SpeechInput} from './speechInput/speechInput';
import {AiAssistant} from '../../../aiAssistant';
import {ButtonPosition} from './buttonPosition';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;
  private readonly _submitButton: SubmitButton;

  constructor(messages: Messages, key: string, aiAssistant: AiAssistant) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles);
    this._submitButton = new SubmitButton(keyboardInput.inputElementRef, messages, key, aiAssistant);
    keyboardInput.submit = this._submitButton.submitFromInput.bind(this._submitButton);
    aiAssistant.submitUserMessage = this._submitButton.submitUserText.bind(this._submitButton);
    ElementUtils.addElements(this.elementRef, keyboardInput.elementRef, this._submitButton.elementRef);
    if (aiAssistant.speechInput) ElementUtils.addElements(this.elementRef, new SpeechInput().elementRef);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(this.elementRef, sideContainers, this._submitButton.elementRef, 'outside-right');
    SideContainers.add(this.elementRef, sideContainers);
  }
}
