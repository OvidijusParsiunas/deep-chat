import {FILE, FILES, TEXT} from '../../../../utils/consts/messageConstants';
import {BrowserStorage} from '../../messages/browserStorage/browserStorage';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {UserContentI} from '../../../../types/messagesInternal';
import {SubmitButton} from '../buttons/submit/submitButton';
import {Websocket} from '../../../../utils/HTTP/websocket';
import {ServiceIO} from '../../../../services/serviceIO';
import {Legacy} from '../../../../utils/legacy/legacy';
import {TextInputEl} from '../textInput/textInput';
import {Demo} from '../../../../utils/demo/demo';
import {DeepChat} from '../../../../deepChat';

type ValidateFunc = (text?: string, files?: File[], isProgrammatic?: boolean) => boolean;

export class ValidationHandler {
  // prettier-ignore
  private static validate(validation: ValidateFunc, submitButton: SubmitButton,
      io: ServiceIO, text?: string, files?: File[], storage?: BrowserStorage, isProgrammatic?: boolean) {
    const isValid = io.isSubmitProgrammaticallyDisabled ? false : validation(text as string, files, isProgrammatic);
    if (isValid) {
      submitButton.changeToSubmitIcon();
    } else {
      submitButton.changeToDisabledIcon();
    }
    storage?.addInputText(text || '');
    return isValid;
  }

  // prettier-ignore
  private static async useValidationFunc(validation: ValidateFunc, textInput: TextInputEl,
      fileAttachments: FileAttachments, submitButton: SubmitButton, io: ServiceIO, storage?: BrowserStorage) {
    const text = textInput.isTextInputEmpty() ? '' : textInput.inputElementRef.textContent;
    await fileAttachments.completePlaceholders();
    const uploadedFilesData = fileAttachments.getAllFileData();
    const fileData = uploadedFilesData?.map((fileData) => fileData[FILE]);
    return ValidationHandler.validate(validation, submitButton, io, text as string, fileData, storage);
  }

  // prettier-ignore
  private static async useValidationFuncProgrammatic(validation: ValidateFunc,
      programmatic: UserContentI, submitButton: SubmitButton, io: ServiceIO, storage?: BrowserStorage) {
    const files = programmatic[FILES]?.map((file) => file[FILE]);
    return ValidationHandler.validate(validation, submitButton, io, programmatic[TEXT], files, storage, true);
  }

  private static validateWebsocket(serviceIO: ServiceIO, submitButton: SubmitButton) {
    const {websocket, connectSettings} = serviceIO;
    if (websocket && connectSettings.url !== Demo.URL && !Websocket.canSendMessage(websocket)) {
      submitButton.changeToDisabledIcon();
      return false;
    }
    return true;
  }

  // prettier-ignore
  public static attach(deepChat: DeepChat, io: ServiceIO, textInput: TextInputEl,
      fileAttachments: FileAttachments, submitButton: SubmitButton, storage?: BrowserStorage) {
    const validateInput = deepChat.validateInput || Legacy.processValidateInput(deepChat);
    deepChat._validationHandler = async (programmatic?: UserContentI) => {
      if (submitButton.status.loadingActive || submitButton.status.requestInProgress) return false;
      if (!ValidationHandler.validateWebsocket(io, submitButton)) return false;
      const validation = validateInput || io.canSendMessage;
      if (validation) {
        if (programmatic) {
          return ValidationHandler.useValidationFuncProgrammatic(validation, programmatic, submitButton, io, storage);
        }
        return ValidationHandler.useValidationFunc(validation, textInput, fileAttachments, submitButton, io, storage);
      }
      return null;
    };
  }
}
