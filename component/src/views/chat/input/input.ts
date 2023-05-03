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
import {ButtonPositions} from './buttons/buttonPositions';
import {BUTTON_TYPES} from '../../../types/buttonTypes';
import {ButtonStyling} from './buttons/buttonStyling';
import {ButtonPosition} from '../../../types/button';
import {DropupButton} from './dropup/dropupButton';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Messages} from '../messages/messages';

type Positions = {[key in ButtonPosition]: ButtonProps[]};

type ButtonProps = {button: ButtonStyling; fileType?: FileAttachmentsType};

type Buttons = {
  [key in BUTTON_TYPES]?: ButtonProps;
};

export class Input {
  readonly elementRef: HTMLElement;

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
    const positions = ButtonPositions.generatePositions(buttons);
    const sideContainers = SideContainers.create();
    if (positions['dropup-menu'].length > 0) Input.addToDropup(panel, sideContainers, positions);
    Input.addToSideContainer(panel, sideContainers, positions);
    SideContainers.add(panel, sideContainers);
  }

  private static addToDropup(panel: HTMLElement, sideContainers: SideContainersT, positions: Positions) {
    const dropupButton = new DropupButton();
    positions['dropup-menu'].forEach((buttonProps) => {
      if (buttonProps.button.svgIconElement) {
        dropupButton.addItem(buttonProps.button.svgIconElement, buttonProps.button.dropupText);
      }
    });
    SideContainers.addButton(panel, sideContainers, dropupButton.elementRef, 'outside-left');
  }

  private static addToSideContainer(panel: HTMLElement, sideContainers: SideContainersT, positions: Positions) {
    const sideContainerPositions = ['inside-left', 'inside-right', 'outside-left', 'outside-right'];
    sideContainerPositions.forEach((sideContainerPosition) => {
      const position = sideContainerPosition as keyof Positions;
      positions[position].forEach((buttonProps) => {
        SideContainers.addButton(panel, sideContainers, buttonProps.button.elementRef, position);
      });
    });
  }
}
