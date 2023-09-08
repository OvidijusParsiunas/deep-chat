import {CustomServiceResponse} from '../../types/customService';
import {ErrorMessages} from '../errorMessages/errorMessages';
import {Messages} from '../../views/chat/messages/messages';
import {ServiceIO} from '../../services/serviceIO';
import {RequestUtils} from './requestUtils';
import {Demo} from '../demo/demo';
import {Stream} from './stream';

export class Websocket {
  public static setup(io: ServiceIO, websocketConfig: boolean | string | string[]) {
    if (io.requestSettings.url !== Demo.URL) {
      io.permittedErrorPrefixes = ['Connection error', 'Error in server message'];
      const protocols = typeof websocketConfig !== 'boolean' ? websocketConfig : undefined;
      try {
        // this will throw an error when url doesn't start with 'ws:'
        io.websocket = new WebSocket(io.requestSettings.url || '', protocols);
      } catch (e) {
        console.error(e);
        io.websocket = 'error'; // we mark it as 'error' to display error message later
      }
    }
  }

  public static assignListeners(io: ServiceIO, messages: Messages) {
    if (!io.websocket || io.websocket === 'error') return messages.addNewErrorMessage('service', 'Connection error');
    io.websocket.onmessage = async (message) => {
      if (!io.extractResultData) return; // this return should theoretically not execute
      try {
        const result: CustomServiceResponse = JSON.parse(message.data);
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
    io.websocket.onerror = (error) => {
      console.error(error);
      messages.addNewErrorMessage('service', 'Connection error');
    };
    io.websocket.onclose = () => {
      console.error('Connection closed');
      // this is used to prevent two error messages displayed when websocket throws error and close events at the same time
      if (!messages.isLastMessageError()) messages.addNewErrorMessage('service', 'Connection error');
    };
  }

  public static async sendWebsocket(ws: WebSocket, io: ServiceIO, body: object, messages: Messages, stringifyBody = true) {
    const requestDetails = {body, headers: io.requestSettings?.headers};
    const {body: interceptedBody, error} = await RequestUtils.processResponseInterceptor(io.deepChat, requestDetails);
    if (error) return messages.addNewErrorMessage('service', error);
    const processedBody = stringifyBody ? JSON.stringify(interceptedBody) : interceptedBody;
    if (io.requestSettings?.url === Demo.URL) {
      return Demo.request(messages, io.completionsHandlers.onFinish, io.deepChat.responseInterceptor);
    }
    if (ws.readyState !== ws.OPEN) {
      console.error('Connection is not open');
      messages.addNewErrorMessage('service', 'Connection error');
    } else {
      ws.send(JSON.stringify(processedBody));
    }
  }
}
