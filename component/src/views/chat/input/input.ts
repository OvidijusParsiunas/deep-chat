import {MicrophoneButton} from './buttons/microphone/microphoneButton';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {ButtonPosition} from './buttons/buttonPosition';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;

  // prettier-ignore
  constructor(messages: Messages, key: string, aiAssistant: AiAssistant) {
    this.elementRef = Input.createPanelElement(aiAssistant.inputStyles?.panel);
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles);
    const submitButton = new SubmitButton(keyboardInput.inputElementRef, messages, key, aiAssistant);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submitUserText.bind(submitButton);
    const microphoneButton = aiAssistant.speechInput
      ? new MicrophoneButton(aiAssistant.speechInput, keyboardInput.inputElementRef,
          messages.addNewErrorMessage.bind(messages)) : undefined;
    Input.addElements(this.elementRef, aiAssistant, keyboardInput.elementRef,
      submitButton.elementRef, microphoneButton?.elementRef);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const element = document.createElement('div');
    element.id = 'input';
    Object.assign(element.style, customStyle);
    return element;
  }

  // prettier-ignore
  private static addElements(panel: HTMLElement, aiAssistant: AiAssistant, keyboardInputEl: HTMLElement,
      submitButtonEl: HTMLElement, microphoneButton?: HTMLElement) {
    ElementUtils.addElements(panel, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(panel, sideContainers, submitButtonEl, aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (microphoneButton && aiAssistant.speechInput) {
      const position = typeof aiAssistant.speechInput === 'boolean' ? 'outside-right' : aiAssistant.speechInput.position;
      ButtonPosition.add(panel, sideContainers, microphoneButton, position || 'outside-right');
    }
    SideContainers.add(panel, sideContainers);
  }
}
