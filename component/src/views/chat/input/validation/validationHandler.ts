import {FileAttachments} from '../fileAttachments/fileAttachments';
import {SubmitButton} from '../buttons/submit/submitButton';
import {Websocket} from '../../../../utils/HTTP/websocket';
import {ServiceIO} from '../../../../services/serviceIO';
import {Legacy} from '../../../../utils/legacy/legacy';
import {TextInputEl} from '../textInput/textInput';
import {DeepChat} from '../../../../deepChat';

export type ValidateFunc = (text?: string, files?: File[], isProgrammatic?: boolean) => boolean;

export class ValidationHandler {
  // prettier-ignore
  private static async useValidationFunc(validation: ValidateFunc, textInput: TextInputEl,
      fileAttachments: FileAttachments, submitButton: SubmitButton, isProgrammatic: boolean) {
    const inputElement = textInput.inputElementRef;
    const text = inputElement.classList.contains('text-input-placeholder') ? '' : inputElement.textContent;
    await fileAttachments.completePlaceholders();
    const uploadedFilesData = fileAttachments.getAllFileData();
    const fileData = uploadedFilesData?.map((fileData) => fileData.file);
    const isValid = validation(text as string, fileData, isProgrammatic);
    if (isValid) {
      submitButton.changeToSubmitIcon();
    } else {
      submitButton.changeToDisabledIcon();
    }
    return isValid;
  }

  private static validateWebsocket(serviceIO: ServiceIO, submitButton: SubmitButton) {
    if (serviceIO.websocket && !Websocket.canSendMessage(serviceIO.websocket)) {
      submitButton.changeToDisabledIcon();
      return false;
    }
    return true;
  }

  // prettier-ignore
  public static attach(deepChat: DeepChat, serviceIO: ServiceIO, textInput: TextInputEl,
      fileAttachments: FileAttachments, submitButton: SubmitButton) {
    const validateInput = deepChat.validateInput || Legacy.processValidateInput(deepChat);
    deepChat._validationHandler = async (isProgrammatic = false) => {
      if (submitButton.status.loadingActive || submitButton.status.requestInProgress) return false;
      if (serviceIO.isSubmitProgrammaticallyDisabled === true) return false;
      if (!ValidationHandler.validateWebsocket(serviceIO, submitButton)) return false;
      const validation = validateInput || serviceIO.canSendMessage;
      if (validation) {
        return ValidationHandler.useValidationFunc(validation, textInput, fileAttachments, submitButton, isProgrammatic);
      }
      return null;
    };
  }
}
