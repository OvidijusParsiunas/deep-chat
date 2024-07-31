import {FileAttachments} from '../fileAttachments/fileAttachments';
import {UserContentI} from '../../../../types/messagesInternal';
import {SubmitButton} from '../buttons/submit/submitButton';
import {Websocket} from '../../../../utils/HTTP/websocket';
import {ServiceIO} from '../../../../services/serviceIO';
import {Legacy} from '../../../../utils/legacy/legacy';
import {TextInputEl} from '../textInput/textInput';
import {DeepChat} from '../../../../deepChat';

type ValidateFunc = (text?: string, files?: File[], isProgrammatic?: boolean) => boolean;

export class ValidationHandler {
  // prettier-ignore
  private static validate(validation: ValidateFunc,
      submitButton: SubmitButton, text?: string, files?: File[], isProgrammatic?: boolean) {
    const isValid = validation(text as string, files, isProgrammatic);
    if (isValid) {
      submitButton.changeToSubmitIcon();
    } else {
      submitButton.changeToDisabledIcon();
    }
    return isValid;
  }

  // prettier-ignore
  private static async useValidationFunc(validation: ValidateFunc,
      textInput: TextInputEl, fileAttachments: FileAttachments, submitButton: SubmitButton) {
    const text = textInput.isTextInputEmpty() ? '' : textInput.inputElementRef.textContent;
    await fileAttachments.completePlaceholders();
    const uploadedFilesData = fileAttachments.getAllFileData();
    const fileData = uploadedFilesData?.map((fileData) => fileData.file);
    return ValidationHandler.validate(validation, submitButton, text as string, fileData);
  }

  // prettier-ignore
  private static async useValidationFuncProgrammatic(validation: ValidateFunc,
      programmatic: UserContentI, submitButton: SubmitButton) {
    const files = programmatic.files?.map((file) => file.file);
    return ValidationHandler.validate(validation, submitButton, programmatic.text, files, true);
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
    deepChat._validationHandler = async (programmatic?: UserContentI) => {
      if (submitButton.status.loadingActive || submitButton.status.requestInProgress) return false;
      if (serviceIO.isSubmitProgrammaticallyDisabled === true) return false;
      if (!ValidationHandler.validateWebsocket(serviceIO, submitButton)) return false;
      const validation = validateInput || serviceIO.canSendMessage;
      if (validation) {
        if (programmatic) return ValidationHandler.useValidationFuncProgrammatic(validation, programmatic, submitButton);
        return ValidationHandler.useValidationFunc(validation, textInput, fileAttachments, submitButton);
      }
      return null;
    };
  }
}
