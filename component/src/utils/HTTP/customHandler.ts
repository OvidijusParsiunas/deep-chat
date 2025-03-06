import {MessageStream} from '../../views/chat/messages/stream/messageStream';
import {MessageUtils} from '../../views/chat/messages/utils/messageUtils';
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
    const onResponse = async (response: Response | Response[]) => {
      if (!isHandlerActive) return;
      isHandlerActive = false; // need to set it here due to asynchronous code below
      const result = await RequestUtils.basicResponseProcessing(messages, response, {io, displayError: false});
      if (!result) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
        io.completionsHandlers.onFinish();
      } else {
        const messageDataArr = Array.isArray(result) ? result : [result];
        const errorMessage = messageDataArr.find((message) => typeof message.error === 'string');
        if (errorMessage) {
          console.error(errorMessage.error);
          messages.addNewErrorMessage('service', errorMessage.error);
          io.completionsHandlers.onFinish();
        } else if (Stream.isSimulatable(io.stream, result as Response)) {
          Stream.simulate(messages, io.streamHandlers, result as Response);
        } else {
          messageDataArr.forEach((message) => messages.addNewMessage(message));
          io.completionsHandlers.onFinish();
        }
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
    const onResponse = async (response: Response | Response[]) => {
      if (!isHandlerActive) return;
      const result = await RequestUtils.basicResponseProcessing(messages, response, {io, displayError: false}) as Response;
      if (!result) {
        const errorMessage = ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result);
        CustomHandler.streamError(errorMessage, stream, io, messages);
        isHandlerActive = false;
      } else if (result.error) {
        CustomHandler.streamError(result.error, stream, io, messages);
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

  private static streamError(errorMessage: string, stream: MessageStream, io: ServiceIO, messages: Messages) {
    console.error(errorMessage);
    stream.finaliseStreamedMessage();
    messages.addNewErrorMessage('service', errorMessage);
    io.streamHandlers.onClose();
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
    const onResponse = async (response: Response | Response[]) => {
      if (!internalConfig.isOpen) return;
      const result = await RequestUtils.basicResponseProcessing(messages, response, {io, displayError: false});
      if (!result) {
        console.error(ErrorMessages.INVALID_RESPONSE(response, 'server', !!io.deepChat.responseInterceptor, result));
        messages.addNewErrorMessage('service', 'Error in server message');
      } else {
        const messageDataArr = Array.isArray(result) ? result : [result];
        const errorMessage = messageDataArr.find((message) => typeof message.error === 'string');
        if (errorMessage) {
          console.error(errorMessage.error);
          if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', errorMessage.error);
        } else if (Stream.isSimulation(io.stream)) {
          const message = result as Response; // array not supported for streaming
          const upsertFunc = Websocket.stream.bind(this, io, messages, internalConfig.roleToStream);
          const stream = (internalConfig.roleToStream as RoleToStream)[message.role || MessageUtils.AI_ROLE];
          Stream.upsertWFiles(messages, upsertFunc, stream, message);
        } else {
          messageDataArr.forEach((message) => messages.addNewMessage(message));
        }
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
