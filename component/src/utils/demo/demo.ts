import {AUDIO, ERROR, FILES, IMAGE, SERVICE, SRC, TEXT} from '../consts/messageConstants';
import {MessageContentI, MessageToElements} from '../../types/messagesInternal';
import {Messages} from '../../views/chat/messages/messages';
import {ServiceIO} from '../../services/serviceIO';
import {RequestUtils} from '../HTTP/requestUtils';
import {DemoResponse} from '../../types/demo';
import {Response} from '../../types/response';
import {Stream} from '../HTTP/stream';

export class Demo {
  public static readonly URL = 'deep-chat-demo';

  private static generateResponse(messageToElements: MessageToElements) {
    const requestMessage = messageToElements[messageToElements.length - 1][0];
    if (requestMessage[FILES] && requestMessage[FILES].length > 0) {
      if (requestMessage[FILES].length > 1) {
        return 'These are interesting files!';
      }
      const file = requestMessage[FILES][0];
      if (file[SRC] && file[SRC].startsWith('data:image/gif')) {
        return 'That is a nice gif!';
      }
      if (file.type === IMAGE) {
        return 'That is a nice image!';
      }
      if (file.type === AUDIO) {
        return 'I like the sound of that!';
      }
      return 'That is an interesting file!';
    }
    if (requestMessage[TEXT]) {
      if (requestMessage[TEXT].charAt(requestMessage[TEXT].length - 1) === '?') {
        return "I'm sorry but I can't answer that question...";
      }
      if (requestMessage[TEXT].includes('updog')) {
        return "What's updog?";
      }
    }
    return 'Hi there! This is a demo response!';
  }

  private static getCustomResponse(customResponse: DemoResponse, requestMessage: MessageContentI) {
    if (typeof customResponse === 'function') return customResponse(requestMessage);
    return customResponse;
  }

  private static getResponse({customDemoResponse, messageToElements}: Messages): Response {
    return customDemoResponse
      ? Demo.getCustomResponse(customDemoResponse, messageToElements[messageToElements.length - 1][0])
      : {[TEXT]: Demo.generateResponse(messageToElements)};
  }

  // timeout is used to simulate a timeout for a response to come back
  public static request(io: ServiceIO, messages: Messages) {
    const response = Demo.getResponse(messages);
    setTimeout(async () => {
      const result = await RequestUtils.basicResponseProcessing(messages, response, {io});
      if (!result) return io.completionsHandlers.onFinish();
      const messageDataArr = Array.isArray(result) ? result : [result];
      const errorMessage = messageDataArr.find((message) => typeof message[ERROR] === 'string');
      if (errorMessage) {
        messages.addNewErrorMessage(SERVICE, errorMessage[ERROR]);
        io.completionsHandlers.onFinish();
      } else if (Stream.isSimulatable(io.stream, result as Response)) {
        Stream.simulate(messages, io.streamHandlers, result as Response);
      } else {
        messageDataArr.forEach((data) => messages.addNewMessage(data));
        io.completionsHandlers.onFinish();
      }
    }, 400);
  }

  // timeout is used to simulate a timeout for a response to come back
  public static requestStream(messages: Messages, io: ServiceIO) {
    setTimeout(() => {
      const response = Demo.getResponse(messages);
      Stream.simulate(messages, io.streamHandlers, response, io);
    }, 400);
  }
}
