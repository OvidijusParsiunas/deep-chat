import {MicrophoneButton} from './buttons/microphone/microphoneButton';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {ButtonPosition} from './buttons/buttonPosition';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;

  // prettier-ignore
  constructor(messages: Messages, key: string, aiAssistant: AiAssistant) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'input';
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles);
    const submitButton = new SubmitButton(keyboardInput.inputElementRef, messages, key, aiAssistant);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submitUserText.bind(submitButton);
    const microphoneButton = aiAssistant.speechInput
      ? new MicrophoneButton(aiAssistant.speechInput, keyboardInput.inputElementRef,
          messages.addNewErrorMessage.bind(messages)) : undefined;
    this.addElements(aiAssistant, keyboardInput.elementRef, submitButton.elementRef, microphoneButton?.elementRef);
  }

  // prettier-ignore
  private addElements(aiAssistant: AiAssistant, keyboardInputEl: HTMLElement, submitButtonEl: HTMLElement,
      microphoneButton?: HTMLElement) {
    ElementUtils.addElements(this.elementRef, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(this.elementRef, sideContainers, submitButtonEl,
      aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (microphoneButton && aiAssistant.speechInput) {
      const position = typeof aiAssistant.speechInput === 'boolean' ? 'outside-right' : aiAssistant.speechInput.position;
      ButtonPosition.add(this.elementRef, sideContainers, microphoneButton, position || 'outside-right');
    }
    SideContainers.add(this.elementRef, sideContainers);
  }
}
