import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {ServiceIO} from '../../services/serviceIO';
import {IWebsocketHandler} from './customHandler';
import {Response} from '../../types/response';
import {RequestUtils} from './requestUtils';
import {Demo} from '../demo/demo';
import {Stream} from './stream';

export class Websocket {
  public static setup(io: ServiceIO) {
    if (io.requestSettings.url !== Demo.URL) {
      io.permittedErrorPrefixes = ['Connection error', 'Error in server message'];
      io.websocket = 'pending'; // main reason why not connecting here is because messages is not available yet
    }
  }

  public static createConnection(io: ServiceIO, messages: Messages) {
    if (!document.body.contains(io.deepChat)) return; // check if element is still present
    const websocketConfig = io.requestSettings.websocket;
    if (!websocketConfig) return;
    // WORK - will enable this later on
    // if (io.requestSettings.handler) return CustomHandler.websocket(io, messages);
    try {
      const protocols = typeof websocketConfig !== 'boolean' ? websocketConfig : undefined;
      // this will throw an error when url doesn't start with 'ws:'
      const websocket = new WebSocket(io.requestSettings.url || '', protocols);
      io.websocket = websocket;
      io.websocket.onopen = () => {
        // TO-DO - when ability to disable submit button is set, instead of removing error message
        // reenable the submit button
        messages.removeError();
        if (io.websocket && typeof io.websocket === 'object') Websocket.assignListeners(io, websocket, messages);
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
    if (!document.body.contains(io.deepChat)) return; // check if element is still present
    io.websocket = 'pending';
    if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
    setTimeout(() => {
      Websocket.createConnection(io, messages);
    }, 5000);
  }

  private static assignListeners(io: ServiceIO, ws: WebSocket, messages: Messages) {
    ws.onmessage = async (message) => {
      if (!io.extractResultData) return; // this return should theoretically not execute
      try {
        const result: Response = JSON.parse(message.data);
        const finalResult = (await io.deepChat.responseInterceptor?.(result)) || result;
        const resultData = await io.extractResultData(finalResult);
        if (!resultData || typeof resultData !== 'object')
          throw Error(ErrorMessages.INVALID_RESPONSE(result, 'server', !!io.deepChat.responseInterceptor, finalResult));
        if (io.deepChat.stream && resultData.text) {
          Stream.simulate(messages, io.streamHandlers, resultData.text);
        } else {
          messages.addNewMessage(resultData, true, true);
        }
      } catch (error) {
        RequestUtils.displayError(messages, error as object, 'Error in server message');
      }
    };
    ws.onclose = () => {
      console.error('Connection closed');
      // this is used to prevent two error messages displayed when websocket throws error and close events at the same time
      if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
      Websocket.createConnection(io, messages);
    };
  }

  public static async sendWebsocket(io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const ws = io.websocket;
    if (!ws || ws === 'pending') return;
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, error} = await RequestUtils.processRequestInterceptor(io.deepChat, requestDetails);
    if (error) return messages.addNewErrorMessage('service', error);
    if (!Websocket.isWebSocket(ws)) return ws.newUserMessage.listener(interceptedBody);
    const processedBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    if (io.requestSettings?.url === Demo.URL) {
      return Demo.request(messages, io.completionsHandlers.onFinish, io.deepChat.responseInterceptor);
    }
    if (ws.readyState === undefined || ws.readyState !== ws.OPEN) {
      console.error('Connection is not open');
      if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
    } else {
      ws.send(JSON.stringify(processedBody));
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
}
