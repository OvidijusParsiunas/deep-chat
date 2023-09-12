import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestDetails} from '../../types/interceptors';
import {ServiceIO} from '../../services/serviceIO';
import {Response} from '../../types/response';
import {RequestUtils} from './requestUtils';
import {Stream} from './stream';

export class CustomHandler {
  public static async request(io: ServiceIO, body: RequestDetails['body'], messages: Messages) {
    io.requestSettings
      .handler?.(body)
      .then(async (result: Response) => {
        if (!io.extractResultData) return; // this return should theoretically not execute
        const finalResult = (await io.deepChat.responseInterceptor?.(result)) || result;
        const resultData = await io.extractResultData(finalResult);
        if (!resultData || typeof resultData !== 'object')
          throw Error(ErrorMessages.INVALID_RESPONSE(result, 'response', !!io.deepChat.responseInterceptor, resultData));
        if (io.deepChat.stream && resultData.text) {
          Stream.simulate(messages, io.streamHandlers, resultData.text);
        } else {
          messages.addNewMessage(resultData, true, true);
          io.completionsHandlers.onFinish();
        }
      })
      .catch((err) => {
        RequestUtils.displayError(messages, err);
        io.completionsHandlers.onFinish();
      });
  }

  public static async stream(io: ServiceIO, body: RequestDetails['body'], messages: Messages) {
    let isHandlerActive = true;
    let isOpen = false;
    let textElement: HTMLElement | null = null;
    const onOpen = () => {
      if (isOpen || !isHandlerActive) return;
      textElement = messages.addNewStreamedMessage();
      io.streamHandlers.onOpen();
      isOpen = true;
    };
    const onClose = () => {
      if (!isHandlerActive) return;
      messages.finaliseStreamedMessage();
      io.streamHandlers.onClose();
      isHandlerActive = false;
    };
    const onResult = (result: {text?: string; error?: string}) => {
      if (!isHandlerActive) return;
      if (result.error) {
        console.error(result.error);
        messages.finaliseStreamedMessage();
        io.streamHandlers.onClose();
        messages.addNewErrorMessage('service', result.error);
        isHandlerActive = false;
      } else if (result.text && textElement) {
        messages.updateStreamedMessage(result.text, textElement);
      }
    };
    io.streamHandlers.abortStream.abort = () => {
      messages.finaliseStreamedMessage();
      io.streamHandlers.onClose();
      isHandlerActive = false;
    };
    io.requestSettings.streamHandler?.(body, {onOpen, onResult, onClose, stopClicked: io.streamHandlers.stopClicked});
  }
}
