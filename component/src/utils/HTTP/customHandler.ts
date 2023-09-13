import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestDetails} from '../../types/interceptors';
import {ServiceIO} from '../../services/serviceIO';
import {Response} from '../../types/response';
import {Stream} from './stream';

export interface IWebsocketHandler {
  isOpen: boolean;
  newUserMessage: {listener: (text: string) => void};
}

export class CustomHandler {
  public static async request(io: ServiceIO, body: RequestDetails['body'], messages: Messages) {
    let isHandlerActive = true;
    const onResponse = async (response: Response) => {
      if (!isHandlerActive) return;
      const result = (await io.deepChat.responseInterceptor?.(response)) || response;
      if (!result || typeof result !== 'object' || (typeof result.error !== 'string' && typeof result.text !== 'string')) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
        io.completionsHandlers.onFinish();
      } else if (typeof result.error === 'string') {
        console.error(result.error);
        messages.addNewErrorMessage('service', result.error);
        io.completionsHandlers.onFinish();
      } else if (io.deepChat.stream && result.text) {
        Stream.simulate(messages, io.streamHandlers, result.text);
      } else {
        messages.addNewMessage(result, true, true);
        io.completionsHandlers.onFinish();
      }
      isHandlerActive = false;
    };
    io.requestSettings.handler?.(body, {onResponse: onResponse});
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
    const onResponse = (result: {text?: string; error?: string}) => {
      if (!isHandlerActive) return;
      if (!result || typeof result !== 'object' || (typeof result.error !== 'string' && typeof result.text !== 'string')) {
        console.error(ErrorMessages.INVALID_RESPONSE(result, 'server', false));
      } else if (result.error) {
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
    const signals = {onOpen, onResponse, onClose, stopClicked: io.streamHandlers.stopClicked};
    io.requestSettings.handler?.(body, signals);
  }

  public static websocket(io: ServiceIO, messages: Messages) {
    const internalConfig = {isOpen: false, newUserMessage: {listener: () => {}}};
    io.websocket = internalConfig;
    const onOpen = () => {
      messages.removeError();
      internalConfig.isOpen = true;
    };
    const onClose = () => {
      internalConfig.isOpen = false;
    };
    const onResponse = async (response: {text?: string; error?: string}) => {
      if (!internalConfig.isOpen) return;
      const result = (await io.deepChat.responseInterceptor?.(response)) || response;
      if (!result || typeof result !== 'object' || (typeof result.error !== 'string' && typeof result.text !== 'string')) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
      } else if (typeof result.error === 'string') {
        console.error(result.error);
        if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', result.error);
      } else if (io.deepChat.stream) {
        Stream.simulate(messages, io.streamHandlers, result.text);
      } else {
        messages.addNewMessage(result, true, true);
      }
    };
    const signals = {onOpen, onResponse, onClose, newUserMessage: internalConfig.newUserMessage};
    io.requestSettings.handler?.(undefined, signals);
  }
}
