import {UPLOAD_IMAGES_ICON_STRING} from '../../../icons/uploadImagesIcon';
import {UploadFileButton} from './buttons/uploadFile/uploadFileButton';
import {MicrophoneButton} from './buttons/microphone/microphoneButton';
import {FileAttachments} from './fileAttachments/fileAttachments';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SideContainers} from './sideContainers/sideContainers';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {AUDIO_ICON_STRING} from '../../../icons/audioIcon';
import {DragAndDrop} from './fileAttachments/dragAndDrop';
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
    const {fileAttachments, uploadFileButtons} = this.createFileUploadComponents(aiAssistant, serviceIO, containerElement);
    const submitButton = new SubmitButton(aiAssistant, keyboardInput.inputElementRef, messages, serviceIO,fileAttachments);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submit.bind(submitButton);
    const microphoneButton = aiAssistant.speechInput
      ? new MicrophoneButton(aiAssistant.speechInput, keyboardInput.inputElementRef,
          messages.addNewErrorMessage.bind(messages)) : undefined;
    Input.addElements(this.elementRef, aiAssistant, keyboardInput.elementRef, submitButton.elementRef, uploadFileButtons,
      microphoneButton?.elementRef);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const panelElement = document.createElement('div');
    panelElement.id = 'input';
    Object.assign(panelElement.style, customStyle);
    return panelElement;
  }

  // prettier-ignore
  private createFileUploadComponents(aiAssistant: AiAssistant, serviceIO: ServiceIO, containerElement: HTMLElement) {
    const fileAttachments = new FileAttachments(this.elementRef, serviceIO, aiAssistant.attachmentContainerStyle);
    DragAndDrop.attemptToAdd(containerElement, fileAttachments, serviceIO, aiAssistant.dragAndDropStyle);
    const uploadFileButtons: UploadFileButton[] = [];
    if (serviceIO.images) {
      const button = new UploadFileButton(
        containerElement, fileAttachments, serviceIO.images, 'upload-images-icon', UPLOAD_IMAGES_ICON_STRING);
      uploadFileButtons.push(button);
    }
    if (serviceIO.audio) {
      const button = new UploadFileButton(
        containerElement, fileAttachments, serviceIO.audio, 'upload-audio-icon', AUDIO_ICON_STRING);
      uploadFileButtons.push(button);
    }
    return {fileAttachments, uploadFileButtons};
  }

  // prettier-ignore
  private static addElements(panel: HTMLElement, aiAssistant: AiAssistant, keyboardInputEl: HTMLElement,
      submitButtonEl: HTMLElement, uploadFileButtons: UploadFileButton[], microphoneButton?: HTMLElement) {
    ElementUtils.addElements(panel, keyboardInputEl);
    const sideContainers = SideContainers.create();
    ButtonPosition.add(panel, sideContainers, submitButtonEl, aiAssistant.submitButtonStyles?.position || 'inside-right');
    if (microphoneButton && aiAssistant.speechInput) {
      const position = typeof aiAssistant.speechInput === 'boolean' ? 'outside-right' : aiAssistant.speechInput.position;
      ButtonPosition.add(panel, sideContainers, microphoneButton, position || 'outside-right');
    }
    uploadFileButtons.forEach((uploadFileTools) => {
      ButtonPosition.add(panel, sideContainers, uploadFileTools.elementRef, uploadFileTools.position);
    });
    SideContainers.add(panel, sideContainers);
  }
}
