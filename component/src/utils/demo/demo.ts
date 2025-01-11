import {MessageContentI, MessageToElements} from '../../types/messagesInternal';
import {ServiceIO, StreamHandlers} from '../../services/serviceIO';
import {Messages} from '../../views/chat/messages/messages';
import {DemoResponse} from '../../types/demo';
import {Response} from '../../types/response';
import {Stream} from '../HTTP/stream';

export class Demo {
  public static readonly URL = 'deep-chat-demo';

  private static generateResponse(messageToElements: MessageToElements) {
    const requestMessage = messageToElements[messageToElements.length - 1][0];
    if (requestMessage.files && requestMessage.files.length > 0) {
      if (requestMessage.files.length > 1) {
        return 'These are interesting files!';
      }
      const file = requestMessage.files[0];
      if (file.src && file.src.startsWith('data:image/gif')) {
        return 'That is a nice gif!';
      }
      if (file.type === 'image') {
        return 'That is a nice image!';
      }
      if (file.type === 'audio') {
        return 'I like the sound of that!';
      }
      return 'That is an interesting file!';
    }
    if (requestMessage.text) {
      if (requestMessage.text.charAt(requestMessage.text.length - 1) === '?') {
        return "I'm sorry but I can't answer that question...";
      }
      if (requestMessage.text.includes('updog')) {
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
      : {text: Demo.generateResponse(messageToElements)};
  }

  // timeout is used to simulate a timeout for a response to come back
  public static request(io: ServiceIO, messages: Messages) {
    const response = Demo.getResponse(messages);
    setTimeout(async () => {
      const finalResult = (await io.deepChat.responseInterceptor?.(response)) || response;
      const messageDataArr = Array.isArray(finalResult) ? finalResult : [finalResult];
      const errorMessage = messageDataArr.find((message) => typeof message.error === 'string');
      if (errorMessage) {
        messages.addNewErrorMessage('service', errorMessage.error);
        io.completionsHandlers.onFinish();
      } else if (Stream.isSimulatable(io.stream, finalResult as Response)) {
        Stream.simulate(messages, io.streamHandlers, finalResult as Response);
      } else {
        messageDataArr.forEach((data) => messages.addNewMessage(data));
        io.completionsHandlers.onFinish();
      }
    }, 400);
  }

  // timeout is used to simulate a timeout for a response to come back
  public static requestStream(messages: Messages, sh: StreamHandlers) {
    setTimeout(() => {
      const response = Demo.getResponse(messages);
      Stream.simulate(messages, sh, response);
    }, 400);
  }
}
