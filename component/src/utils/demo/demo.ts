import {ResponseInterceptor} from '../../types/interceptors';
import {Messages} from '../../views/chat/messages/messages';
import {MessageContent} from '../../types/messages';
import {Result} from '../../types/result';

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

  public static request(messages: Messages, onFinish: Finish, responseInterceptor?: ResponseInterceptor) {
    const responseText = Demo.generateResponse(messages);
    setTimeout(() => {
      const message = {text: responseText};
      const preprocessedMessage = responseInterceptor?.(message) || message;
      messages.addNewMessage(preprocessedMessage as Result, true, true);
      onFinish();
    }, 400);
  }

  public static requestStream(messages: Messages, onOpen: () => void, onClose: () => void) {
    const responseText = Demo.generateResponse(messages).split(' ');
    setTimeout(() => {
      const textElement = messages.addNewStreamedMessage();
      onOpen();
      Demo.populateMessages(textElement, responseText, messages, onClose);
    }, 400);
  }

  // prettier-ignore
  private static populateMessages(
      textElement: HTMLElement, responseText: string[], messages: Messages, onClose: () => void, wordIndex = 0) {
    setTimeout(() => {
      const word = responseText[wordIndex];
      if (word) {
        messages.updateStreamedMessage(`${word} `, textElement);
        Demo.populateMessages(textElement, responseText, messages, onClose, wordIndex + 1);
      } else {
        messages.finaliseStreamedMessage();
        onClose();
      }
    }, 70);
  }
}
