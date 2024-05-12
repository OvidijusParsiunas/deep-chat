import {MessageStream} from '../../views/chat/messages/stream/messageStream';
import {MessageUtils} from '../../views/chat/messages/messageUtils';
import {CustomHandler, IWebsocketHandler} from './customHandler';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {StreamSimulation} from '../../types/stream';
import {ServiceIO} from '../../services/serviceIO';
import {Response} from '../../types/response';
import {RequestUtils} from './requestUtils';
import {DeepChat} from '../../deepChat';
import {Demo} from '../demo/demo';
import {Stream} from './stream';

export type RoleToStream = {[role: string]: MessageStream};

export class Websocket {
  public static setup(io: ServiceIO) {
    if (io.connectSettings.url !== Demo.URL) {
      io.permittedErrorPrefixes = ['Connection error', 'Error in server message'];
      io.websocket = 'pending'; // main reason why not connecting here is because messages is not available yet
    }
  }

  private static isElementPresentInDOM(deepChat: DeepChat) {
    // to make sure that reconnection is not happening when component removed
    // this particular check also works if DeepChat is inside a shadow DOM elem
    // https://github.com/OvidijusParsiunas/deep-chat/pull/194
    return !!(deepChat.getRootNode({composed: true}) instanceof Document);
  }

  public static createConnection(io: ServiceIO, messages: Messages) {
    if (!Websocket.isElementPresentInDOM(io.deepChat)) return;
    const websocketConfig = io.connectSettings.websocket;
    if (!websocketConfig) return;
    if (io.connectSettings.handler) return CustomHandler.websocket(io, messages);
    try {
      const protocols = typeof websocketConfig !== 'boolean' ? websocketConfig : undefined;
      // this will throw an error when url doesn't start with 'ws:'
      const websocket = new WebSocket(io.connectSettings.url || '', protocols);
      io.websocket = websocket;
      io.websocket.onopen = () => {
        messages.removeError();
        if (io.websocket && typeof io.websocket === 'object') Websocket.assignListeners(io, websocket, messages);
        io.deepChat._validationHandler?.();
      };
      io.websocket.onerror = (event) => {
        console.error(event);
        Websocket.retryConnection(io, messages);
      };
    } catch (error) {
      console.error(error);
      Websocket.retryConnection(io, messages);
    }
  }

  private static retryConnection(io: ServiceIO, messages: Messages) {
    io.deepChat._validationHandler?.();
    if (!Websocket.isElementPresentInDOM(io.deepChat)) return;
    io.websocket = 'pending';
    if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
    setTimeout(() => {
      Websocket.createConnection(io, messages);
    }, 5000);
  }

  private static assignListeners(io: ServiceIO, ws: WebSocket, messages: Messages) {
    const roleToStream = {} as RoleToStream;
    ws.onmessage = async (message) => {
      if (!io.extractResultData) return; // this return should theoretically not execute
      try {
        const result: Response = JSON.parse(message.data);
        const finalResult = (await io.deepChat.responseInterceptor?.(result)) || result;
        const resultData = await io.extractResultData(finalResult);
        if (!resultData || typeof resultData !== 'object')
          throw Error(ErrorMessages.INVALID_RESPONSE(result, 'server', !!io.deepChat.responseInterceptor, finalResult));
        if (Stream.isSimulation(io.stream)) {
          const upsertFunc = Websocket.stream.bind(this, io, messages, roleToStream);
          const stream = roleToStream[result.role || MessageUtils.AI_ROLE];
          Stream.upsertWFiles(messages, upsertFunc, stream, resultData);
        } else {
          messages.addNewMessage(resultData);
        }
      } catch (error) {
        RequestUtils.displayError(messages, error as object, 'Error in server message');
      }
    };
    ws.onclose = () => {
      console.error('Connection closed');
      // this is used to prevent two error messages displayed when websocket throws error and close events at the same time
      if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
      if (io.stream) io.streamHandlers.abortStream.abort();
      Websocket.createConnection(io, messages);
    };
  }

  public static async sendWebsocket(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const ws = io.websocket;
    if (!ws || ws === 'pending') return;
    const requestDetails = {body, headers: io.connectSettings?.headers};
    const {body: interceptedBody, error} = await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails);
    if (error) return messages.addNewErrorMessage('service', error);
    if (!Websocket.isWebSocket(ws)) return ws.newUserMessage.listener(interceptedBody);
    const processedBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    if (io.connectSettings?.url === Demo.URL) {
      return Demo.request(io, messages);
    }
    if (ws.readyState === undefined || ws.readyState !== ws.OPEN) {
      console.error('Connection is not open');
      if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
    } else {
      ws.send(JSON.stringify(processedBody));
      io.completionsHandlers.onFinish();
    }
  }

  public static canSendMessage(websocket: ServiceIO['websocket']) {
    if (!websocket) return true;
    if (websocket === 'pending') return false;
    if (Websocket.isWebSocket(websocket)) {
      return websocket.readyState !== undefined && websocket.readyState === websocket.OPEN;
    }
    return websocket.isOpen;
  }

  // if false then it is the internal websocket handler
  private static isWebSocket(websocket: WebSocket | IWebsocketHandler): websocket is WebSocket {
    return (websocket as WebSocket).send !== undefined;
  }

  public static stream(io: ServiceIO, messages: Messages, roleToStream: RoleToStream, result?: Response) {
    if (!result) return;
    const simulation = (io.stream as StreamSimulation).simulation;
    if (typeof simulation === 'string') {
      const role = result.role || MessageUtils.AI_ROLE;
      const stream = roleToStream[role];
      if (result.text === simulation || result.html === simulation) {
        stream?.finaliseStreamedMessage();
        delete roleToStream[role];
      } else {
        roleToStream[role] ??= new MessageStream(messages);
        roleToStream[role].upsertStreamedMessage(result);
      }
    } else {
      Stream.simulate(messages, io.streamHandlers, result);
    }
  }
}
