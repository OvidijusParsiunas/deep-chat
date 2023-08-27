import {ResponseInterceptor} from '../../types/interceptors';
import {Messages} from '../../views/chat/messages/messages';
import {StreamHandlers} from '../../services/serviceIO';
import {MessageContent} from '../../types/messages';
import {DemoResponse} from '../../types/demo';
import {Stream} from '../HTTP/stream';

type Finish = () => void;

export class Demo {
  public static readonly URL = 'deep-chat-demo';

  private static generateResponseForOneMessage(requestMessage: MessageContent) {
    if (requestMessage.file) {
      if (requestMessage.file.type === 'image') {
        return 'That is a nice image!';
      }
      if (requestMessage.file.type === 'audio') {
        return 'I like the sound of that!';
      }
      if (requestMessage.file.type === 'gif') {
        return 'That is a nice gif!';
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

  private static generateResponse(messages: Messages) {
    const requestMessages: MessageContent[] = [];
    for (let i = messages.messages.length - 1; i >= 0; i -= 1) {
      if (messages.messages[i].role === 'ai') break;
      requestMessages.push(messages.messages[i]);
    }
    if (requestMessages.length === 1) {
      return Demo.generateResponseForOneMessage(messages.messages[messages.messages.length - 1]);
    }
    const textMessageIndex = messages.messages.findIndex((message) => message.text);
    if (textMessageIndex !== -1) requestMessages.splice(textMessageIndex, 1);
    if (requestMessages.length === 1) {
      return Demo.generateResponseForOneMessage(messages.messages[messages.messages.length - 1]);
    }
    return 'Wow, very cool files!';
  }

  private static getCustomResponse(customResponse: DemoResponse, requestMessage: MessageContent) {
    if (typeof customResponse === 'function') return customResponse(requestMessage);
    return customResponse;
  }

  private static getResponse(messages: Messages) {
    return messages.customDemoResponse
      ? Demo.getCustomResponse(messages.customDemoResponse, messages.messages[messages.messages.length - 1])
      : {text: Demo.generateResponse(messages)};
  }

  // timeout is used to simulate a timeout for a response to come back
  public static request(messages: Messages, onFinish: Finish, responseInterceptor?: ResponseInterceptor) {
    // encapsulating inside response object to maintain consistency for responseInterceptor
    const response = {result: Demo.getResponse(messages)};
    setTimeout(async () => {
      const preprocessedResponse = (await responseInterceptor?.(response)) || response;
      if (preprocessedResponse.error) {
        messages.addNewErrorMessage('service', preprocessedResponse.error);
      } else {
        messages.addNewMessage(preprocessedResponse.result, true, true);
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
