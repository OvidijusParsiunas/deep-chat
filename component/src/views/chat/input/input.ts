import {MicrophoneButton} from './buttons/microphone/microphoneButton';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {UploadImages} from './uploadImages/uploadImages';
import {ButtonPosition} from './buttons/buttonPosition';
import {ServiceIO} from '../../../services/serviceIO';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

export class Input {
  readonly elementRef: HTMLElement;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, messages: Messages, serviceIO: ServiceIO, containerElement: HTMLElement) {
    this.elementRef = Input.createPanelElement(aiAssistant.inputStyles?.panel);
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles, aiAssistant.inputCharacterLimit);
    const uploadImages = serviceIO.images
      ? new UploadImages(this.elementRef, containerElement, serviceIO.images, aiAssistant.attachmentContainerStyle)
      : undefined;
    const submitButton = new SubmitButton(aiAssistant, keyboardInput.inputElementRef, messages, serviceIO,
      uploadImages?.fileAttachments);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submit.bind(submitButton);
    const microphoneButton = aiAssistant.speechInput
      ? new MicrophoneButton(aiAssistant.speechInput, keyboardInput.inputElementRef,
          messages.addNewErrorMessage.bind(messages)) : undefined;
    Input.addElements(this.elementRef, aiAssistant, serviceIO, keyboardInput.elementRef, submitButton.elementRef,
      microphoneButton?.elementRef, uploadImages?.button.elementRef);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const panelElement = document.createElement('div');
    panelElement.id = 'input';
    Object.assign(panelElement.style, customStyle);
    return panelElement;
  }

  // prettier-ignore
  private static addElements(panel: HTMLElement, aiAssistant: AiAssistant, serviceIO: ServiceIO,
      keyboardInputEl: HTMLElement, submitButtonEl: HTMLElement, microphoneButton?: HTMLElement,
      uploadImagesButton?: HTMLElement) {
    ElementUtils.addElements(panel, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(panel, sideContainers, submitButtonEl, aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (microphoneButton && aiAssistant.speechInput) {
      const position = typeof aiAssistant.speechInput === 'boolean' ? 'outside-right' : aiAssistant.speechInput.position;
      ButtonPosition.add(panel, sideContainers, microphoneButton, position || 'outside-right');
    }
    if (uploadImagesButton) {
      ButtonPosition.add(panel, sideContainers, uploadImagesButton, serviceIO.images?.button?.position || 'outside-left');
    }
    SideContainers.add(panel, sideContainers);
  }
}
