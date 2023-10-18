import {ResponseInterceptor} from '../../types/interceptors';
import {Messages} from '../../views/chat/messages/messages';
import {StreamHandlers} from '../../services/serviceIO';
import {MessageContent} from '../../types/messages';
import {DemoResponse} from '../../types/demo';
import {Response} from '../../types/response';
import {Stream} from '../HTTP/stream';

type Finish = () => void;

export class Demo {
  public static readonly URL = 'deep-chat-demo';

  private static generateResponse(messages: Messages) {
    const requestMessage = messages.messages[messages.messages.length - 1];
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

  private static getCustomResponse(customResponse: DemoResponse, requestMessage: MessageContent) {
    if (typeof customResponse === 'function') return customResponse(requestMessage);
    return customResponse;
  }

  private static getResponse(messages: Messages): Response {
    return messages.customDemoResponse
      ? Demo.getCustomResponse(messages.customDemoResponse, messages.messages[messages.messages.length - 1])
      : {text: Demo.generateResponse(messages)};
  }

  // timeout is used to simulate a timeout for a response to come back
  public static request(messages: Messages, onFinish: Finish, responseInterceptor?: ResponseInterceptor) {
    const response = Demo.getResponse(messages);
    setTimeout(async () => {
      const preprocessedResponse = (await responseInterceptor?.(response)) || response;
      if (preprocessedResponse.error) {
        messages.addNewErrorMessage('service', preprocessedResponse.error);
      } else {
        messages.addNewMessage(preprocessedResponse, true);
      }
      onFinish();
    }, 400);
  }

  // timeout is used to simulate a timeout for a response to come back
  public static requestStream(messages: Messages, sh: StreamHandlers) {
    setTimeout(() => {
      const responseText = Demo.getResponse(messages)?.text;
      Stream.simulate(messages, sh, responseText);
    }, 400);
  }
}
