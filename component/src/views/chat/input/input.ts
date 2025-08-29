import {AudioFileAttachmentType} from './fileAttachments/fileAttachmentTypes/audioFileAttachmentType';
import {InputButtonStyleAdjustments} from './buttons/styleAdjustments/inputButtonStyleAdjustments';
import {FileAttachmentsType} from './fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {FileServiceIO, ServiceFileTypes, ServiceIO} from '../../../services/serviceIO';
import {InputButtonPositions} from './buttons/styleAdjustments/inputButtonPositions';
import {FILE_TYPE_BUTTON_ICONS} from '../../../utils/files/fileTypeButtonIcons';
import {SpeechToText} from './buttons/microphone/speechToText/speechToText';
import {UploadFileButton} from './buttons/uploadFile/uploadFileButton';
import {DragAndDrop} from './fileAttachments/dragAndDrop/dragAndDrop';
import {ButtonContainers} from './buttonContainers/buttonContainers';
import {FileAttachments} from './fileAttachments/fileAttachments';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {ValidationHandler} from './validation/validationHandler';
import {RecordAudio} from './buttons/microphone/recordAudio';
import {FireEvents} from '../../../utils/events/fireEvents';
import {CustomButton} from './buttons/custom/customButton';
import {SubmitButton} from './buttons/submit/submitButton';
import {CameraButton} from './buttons/camera/cameraButton';
import {DropupStyles} from '../../../types/dropupStyles';
import {BUTTON_TYPE} from '../../../types/buttonTypes';
import {InputButton} from './buttons/inputButton';
import {CustomStyle} from '../../../types/styles';
import {TextInputEl} from './textInput/textInput';
import {Messages} from '../messages/messages';
import {DeepChat} from '../../../deepChat';

export type Buttons = {
  [key in BUTTON_TYPE]?: {button: InputButton; fileType?: FileAttachmentsType};
};

export class Input {
  readonly elementRef: HTMLElement;

  constructor(deepChat: DeepChat, messages: Messages, serviceIO: ServiceIO, containerElement: HTMLElement) {
    this.elementRef = Input.createPanelElement(deepChat.inputAreaStyle);
    const buttons: Buttons = {};
    const fileAtts = this.createFileUploadComponents(deepChat, serviceIO, containerElement, buttons);
    const textInput = new TextInputEl(deepChat, serviceIO, fileAtts);
    if (deepChat.speechToText && !buttons.microphone) {
      buttons.microphone = {button: new SpeechToText(deepChat, textInput, messages.addNewErrorMessage.bind(messages))};
    }
    const submitButton = new SubmitButton(deepChat, textInput, messages, serviceIO, fileAtts, buttons);
    textInput.submit = submitButton.submitFromInput.bind(submitButton);
    ValidationHandler.attach(deepChat, serviceIO, textInput, fileAtts, submitButton);
    deepChat.submitUserMessage = submitButton.programmaticSubmit.bind(submitButton);
    buttons.submit = {button: submitButton};
    if (deepChat.customButtons) CustomButton.add(deepChat, buttons);
    Input.addElements(this.elementRef, textInput, buttons, containerElement, fileAtts, deepChat.dropupStyles);
    Input.assignOnInput(deepChat, serviceIO, fileAtts, textInput);
  }

  private static createPanelElement(customStyle?: CustomStyle) {
    const panelElement = document.createElement('div');
    panelElement.id = 'input';
    Object.assign(panelElement.style, customStyle);
    return panelElement;
  }

  // prettier-ignore
  private createFileUploadComponents(
      deepChat: DeepChat, serviceIO: ServiceIO, containerElement: HTMLElement, buttons: Buttons) {
    const fileAttachments = new FileAttachments(this.elementRef, deepChat.attachmentContainerStyle, serviceIO.demo);
    Input.createUploadButtons(deepChat, serviceIO, serviceIO.fileTypes || {}, fileAttachments, containerElement, buttons);
    if (serviceIO.camera?.files) {
      const cameraType = buttons.images?.fileType
        || fileAttachments.addType(deepChat, serviceIO, serviceIO.camera.files, 'images');
      buttons.camera = {button: new CameraButton(containerElement, cameraType, serviceIO.camera)};
    }
    if (serviceIO.recordAudio?.files) {
      const audioType = buttons.audio?.fileType
        || fileAttachments.addType(deepChat, serviceIO, serviceIO.recordAudio.files, 'audio');
      buttons.microphone = {button: new RecordAudio(audioType as AudioFileAttachmentType, serviceIO.recordAudio)};
    }
    if (DragAndDrop.isEnabled(fileAttachments, deepChat.dragAndDrop)) {
      DragAndDrop.create(containerElement, fileAttachments, deepChat.dragAndDrop);
    }
    return fileAttachments;
  }

  // prettier-ignore
  private static createUploadButtons(deepChat: DeepChat, serviceIO: ServiceIO,
      fileTypes: ServiceFileTypes, fileAtt: FileAttachments, containerEl: HTMLElement, buttons: Buttons) {
    Object.keys(fileTypes).forEach((key) => {
      const fileType = key as keyof ServiceFileTypes;
      const fileService = fileTypes[fileType] as FileServiceIO;
      if (fileService.files) {
        const fileAttachmentsType = fileAtt.addType(deepChat, serviceIO, fileService.files, fileType);
        const {id, svgString, dropupText} = FILE_TYPE_BUTTON_ICONS[fileType];
        const button = new UploadFileButton(containerEl, fileAttachmentsType, fileService, id, svgString, dropupText);
        buttons[fileType] = {button, fileType: fileAttachmentsType};
      }
    });
  }

  // prettier-ignore
  private static addElements(panel: HTMLElement, textInput: TextInputEl, buttons: Buttons, container: HTMLElement,
      fileAttachments: FileAttachments, dropupStyles?: DropupStyles) {
    ElementUtils.addElements(panel, textInput.elementRef);
    const buttonContainers = ButtonContainers.create();
    const pToBs = InputButtonPositions.addButtons(buttonContainers, buttons, container, dropupStyles);
    InputButtonStyleAdjustments.set(textInput.inputElementRef, buttonContainers, fileAttachments.elementRef, pToBs);
    ButtonContainers.add(panel, buttonContainers);
  }

  private static assignOnInput(deepChat: DeepChat, io: ServiceIO, fileAtts: FileAttachments, textInput: TextInputEl) {
    io.onInput = (isUser: boolean) => {
      // In a timeout as when submitting files need to wait for their close events to be triggered
      setTimeout(() => {
        const uploadedFilesData = fileAtts.getAllFileData();
        const inputText = textInput.inputElementRef.innerText.trim() as string;
        const content: {text?: string; files?: File[]} = {text: inputText};
        if (uploadedFilesData) content.files = uploadedFilesData.map((file) => file.file);
        FireEvents.onInput(deepChat, content, isUser);
      });
    };
  }
}
