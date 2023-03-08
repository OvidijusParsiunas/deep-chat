import {ElementUtils} from '../../../utils/element/elementUtils';
import {Microphone} from './buttons/microphone/microphoneButton';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {ButtonPosition} from './buttons/buttonPosition';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;

  constructor(messages: Messages, key: string, aiAssistant: AiAssistant) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles);
    const submitButton = new SubmitButton(keyboardInput.inputElementRef, messages, key, aiAssistant);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submitUserText.bind(submitButton);
    this.addElements(aiAssistant, keyboardInput.elementRef, submitButton.elementRef);
  }

  // prettier-ignore
  private addElements(aiAssistant: AiAssistant, keyboardInputEl: HTMLElement, submitButtonEl: HTMLElement) {
    ElementUtils.addElements(this.elementRef, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(this.elementRef, sideContainers, submitButtonEl,
      aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (aiAssistant.speechInput) {
      ButtonPosition.add(this.elementRef, sideContainers, new Microphone().elementRef,
        aiAssistant.submitButtonStyles?.position || 'outside-right');
    }
    SideContainers.add(this.elementRef, sideContainers);
  }
}
