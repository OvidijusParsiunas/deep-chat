import {AudioFileAttachmentType} from './fileAttachments/fileAttachmentTypes/audioFileAttachmentType';
import {FileAttachmentsType} from './fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {FileServiceIO, ServiceFileTypes, ServiceIO} from '../../../services/serviceIO';
import {FILE_TYPE_BUTTON_ICONS} from '../../../utils/fileTypes/fileTypeButtonIcons';
import {SideContainers, SideContainersT} from './sideContainers/sideContainers';
import {UploadFileButton} from './buttons/uploadFile/uploadFileButton';
import {DragAndDrop} from './fileAttachments/dragAndDrop/dragAndDrop';
import {FileAttachments} from './fileAttachments/fileAttachments';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {SpeechToText} from './buttons/microphone/speechToText';
import {RecordAudio} from './buttons/microphone/recordAudio';
import {KeyboardInput} from './keyboardInput/keyboardInput';
import {SubmitButton} from './buttons/submit/submitButton';
import {CameraButton} from './buttons/camera/cameraButton';
import {BUTTON_TYPES} from '../../../types/buttonTypes';
import {ButtonStyling} from './buttons/buttonStyling';
import {DropupButton} from './dropup/dropupButton';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

type Buttons = {
  [key in BUTTON_TYPES]?: {button: ButtonStyling; fileType?: FileAttachmentsType};
};

export class Input {
  readonly elementRef: HTMLElement;
  // this is mostly used for setting a default order for dropup menu items
  private static readonly BUTTON_ORDER: BUTTON_TYPES[] = [
    'camera',
    'images',
    'audio',
    'mixedFiles',
    'submit',
    'microphone',
  ];

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, messages: Messages, serviceIO: ServiceIO, containerElement: HTMLElement) {
    this.elementRef = Input.createPanelElement(aiAssistant.inputStyles?.panel);
    const keyboardInput = new KeyboardInput(aiAssistant.inputStyles, aiAssistant.inputCharacterLimit);
    const buttons: Buttons = {};
    const fileAttachments = this.createFileUploadComponents(aiAssistant, serviceIO, containerElement, buttons);
    if (aiAssistant.speechInput) {
      buttons.microphone = buttons.microphone || {button: new SpeechToText(
        aiAssistant.speechInput, keyboardInput.inputElementRef, messages.addNewErrorMessage.bind(messages))};
    }
    const submitButton = new SubmitButton(aiAssistant, keyboardInput.inputElementRef, messages, serviceIO,fileAttachments);
    keyboardInput.submit = submitButton.submitFromInput.bind(submitButton);
    aiAssistant.submitUserMessage = submitButton.submit.bind(submitButton);
    buttons.submit = {button: submitButton};
    Input.addElements(this.elementRef, keyboardInput.elementRef, buttons);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const panelElement = document.createElement('div');
    panelElement.id = 'input';
    Object.assign(panelElement.style, customStyle);
    return panelElement;
  }

  // prettier-ignore
  private createFileUploadComponents(
      aiAssistant: AiAssistant, serviceIO: ServiceIO, containerElement: HTMLElement, buttons: Buttons) {
    const fileAttachments = new FileAttachments(this.elementRef, aiAssistant.attachmentContainerStyle);
    if (aiAssistant.dragAndDrop) DragAndDrop.create(containerElement, fileAttachments, aiAssistant.dragAndDrop);
    Input.createUploadButtons(serviceIO.fileTypes || {}, fileAttachments, containerElement, buttons);
    if (serviceIO.camera?.files) {
      const cameraType = buttons.images?.fileType || fileAttachments.addType(serviceIO.camera.files, 'images');
      buttons.camera = {button: new CameraButton(containerElement, cameraType, serviceIO.camera)};
    }
    if (serviceIO.recordAudio?.files) {
      const audioType = buttons.audio?.fileType || fileAttachments.addType(serviceIO.recordAudio.files, 'audio');
      buttons.microphone = {button: new RecordAudio(audioType as AudioFileAttachmentType, serviceIO.recordAudio)};
    }
    return fileAttachments;
  }

  // prettier-ignore
  private static createUploadButtons(
      fileTypes: ServiceFileTypes, fileAtt: FileAttachments, containerEl: HTMLElement, buttons: Buttons) {
    Object.keys(fileTypes).forEach((key) => {
      const fileType = key as keyof ServiceFileTypes;
      const fileService = fileTypes[fileType] as FileServiceIO;
      if (fileService.files) {
        const fileAttachmentsType = fileAtt.addType(fileService.files, fileType);
        const {id, svgString, dropupText} = FILE_TYPE_BUTTON_ICONS[fileType];
        const button = new UploadFileButton(containerEl, fileAttachmentsType, fileService, id, svgString, dropupText);
        buttons[fileType] = {button, fileType: fileAttachmentsType};
      }
    });
  }

  private static addElements(panel: HTMLElement, keyboardInputEl: HTMLElement, buttons: Buttons) {
    ElementUtils.addElements(panel, keyboardInputEl);
    const sideContainers = SideContainers.create();
    const dropupButton = new DropupButton();
    Input.BUTTON_ORDER.forEach((buttonType) => {
      const button = buttons[buttonType]?.button;
      if (button) Input.addElement(button, panel, dropupButton, sideContainers);
    });
    SideContainers.addButton(panel, sideContainers, dropupButton);
    SideContainers.add(panel, sideContainers);
  }

  // prettier-ignore
  private static addElement(button: ButtonStyling, panel: HTMLElement, dropupButton: DropupButton,
      sideContainer: SideContainersT) {
    if (button.position === 'dropup-menu' && button.svgIconElement) {
      dropupButton.addItem(button.svgIconElement, button.dropupText);
    } else {
      SideContainers.addButton(panel, sideContainer, button);
    }
  }
}
