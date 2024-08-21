import {MessageStream} from '../../views/chat/messages/stream/messageStream';
import {MessageUtils} from '../../views/chat/messages/messageUtils';
import {MessagesBase} from '../../views/chat/messages/messagesBase';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {RequestDetails} from '../../types/interceptors';
import {RoleToStream, Websocket} from './websocket';
import {ServiceIO} from '../../services/serviceIO';
import {Response} from '../../types/response';
import {RequestUtils} from './requestUtils';
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
      isHandlerActive = false; // need to set it here due to asynchronous code below
      const result = (await io.deepChat.responseInterceptor?.(response)) || response;
      if (!RequestUtils.validateResponseFormat(result)) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
        io.completionsHandlers.onFinish();
      } else if (typeof result.error === 'string') {
        console.error(result.error);
        messages.addNewErrorMessage('service', result.error);
        io.completionsHandlers.onFinish();
      } else if (Stream.isSimulatable(io.stream, result)) {
        Stream.simulate(messages, io.streamHandlers, result);
      } else {
        messages.addNewMessage(result);
        io.completionsHandlers.onFinish();
      }
    };
    const signals = CustomHandler.generateOptionalSignals();
    io.connectSettings.handler?.(body, {...signals, onResponse});
  }

  private static attemptToFinaliseStream(stream: MessageStream, messages: Messages) {
    try {
      const lastMessageEls = messages.messageElementRefs[messages.messageElementRefs.length - 1];
      const isLastMessageLoading = MessagesBase.isLoadingMessage(lastMessageEls);
      if (isLastMessageLoading) {
        messages.removeLastMessage();
      } else {
        stream.finaliseStreamedMessage();
      }
    } catch (error) {
      console.error(error);
      messages.addNewErrorMessage('service', error as Error);
    }
  }

  // prettier-ignore
  public static stream(io: ServiceIO, body: RequestDetails['body'], messages: Messages) {
    let isHandlerActive = true;
    let isOpen = false;
    const stream = new MessageStream(messages);
    const onOpen = () => {
      if (isOpen || !isHandlerActive) return;
      io.streamHandlers.onOpen();
      isOpen = true;
    };
    const onClose = () => {
      if (!isHandlerActive) return;
      CustomHandler.attemptToFinaliseStream(stream, messages);
      io.streamHandlers.onClose();
      isHandlerActive = false;
    };
    const onResponse = async (response: Response) => {
      if (!isHandlerActive) return;
      const result = (await io.deepChat.responseInterceptor?.(response)) || response;
      if (!RequestUtils.validateResponseFormat(result)) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
      } else if (result.error) {
        console.error(result.error);
        stream.finaliseStreamedMessage();
        messages.addNewErrorMessage('service', result.error);
        io.streamHandlers.onClose();
        isHandlerActive = false;
      } else {
        Stream.upsertWFiles(messages, stream.upsertStreamedMessage.bind(stream), stream, result);
      }
    };
    io.streamHandlers.abortStream.abort = () => {
      CustomHandler.attemptToFinaliseStream(stream, messages);
      io.streamHandlers.onClose();
      isHandlerActive = false;
    };
    const signals = CustomHandler.generateOptionalSignals();
    io.connectSettings.handler?.(body,
      {...signals, onOpen, onResponse, onClose, stopClicked: io.streamHandlers.stopClicked});
  }

  // prettier-ignore
  public static websocket(io: ServiceIO, messages: Messages) {
    const internalConfig = {isOpen: false, newUserMessage: {listener: () => {}}, roleToStream: {}};
    io.websocket = internalConfig;
    const onOpen = () => {
      messages.removeError();
      internalConfig.isOpen = true;
    };
    const onClose = () => {
      internalConfig.isOpen = false;
    };
    const onResponse = async (response: Response) => {
      if (!internalConfig.isOpen) return;
      const result = (await io.deepChat.responseInterceptor?.(response)) || response;
      if (!RequestUtils.validateResponseFormat(result)) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
      } else if (typeof result.error === 'string') {
        console.error(result.error);
        if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', result.error);
      } else if (Stream.isSimulation(io.stream)) {
        const upsertFunc = Websocket.stream.bind(this, io, messages, internalConfig.roleToStream);
        const stream = (internalConfig.roleToStream as RoleToStream)[response.role || MessageUtils.AI_ROLE];
        Stream.upsertWFiles(messages, upsertFunc, stream, response);
      } else {
        messages.addNewMessage(result);
      }
    };
    const signals = CustomHandler.generateOptionalSignals();
    io.connectSettings.handler?.(undefined,
      {...signals, onOpen, onResponse, onClose, newUserMessage: internalConfig.newUserMessage});
  }

  private static generateOptionalSignals() {
    return {onClose: () => {}, onOpen: () => {}, stopClicked: {listener: () => {}}, newUserMessage: {listener: () => {}}};
  }
}
