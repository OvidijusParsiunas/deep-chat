import {ResponseInterceptor} from '../../types/interceptors';
import {Messages} from '../../views/chat/messages/messages';
import {Result} from '../../types/result';

type Finish = () => void;

export class Demo {
  public static readonly URL = 'deep-chat-demo';
  private static readonly EXAMPLE_AI_MESSAGE = 'Hello! I am a helpful AI assistant!';
  private static readonly EXAMPLE_AI_STREAMED_MESSAGE = 'How are you doing?'.split(' ');

  public static request(messages: Messages, onFinish: Finish, responseInterceptor: ResponseInterceptor) {
    setTimeout(() => {
      const message = {text: Demo.EXAMPLE_AI_MESSAGE};
      const preprocessedMessage = responseInterceptor(message);
      messages.addNewMessage(preprocessedMessage as Result, true, true);
      onFinish();
    }, 400);
  }

  public static requestStream(messages: Messages, onOpen: () => void, onClose: () => void) {
    setTimeout(() => {
      const textElement = messages.addNewStreamedMessage();
      onOpen();
      Demo.populateMessages(textElement, messages, onClose);
    }, 400);
  }

  public static populateMessages(textElement: HTMLElement, messages: Messages, onClose: () => void, wordIndex = 0) {
    setTimeout(() => {
      const word = Demo.EXAMPLE_AI_STREAMED_MESSAGE[wordIndex];
      if (word) {
        messages.updateStreamedMessage(`${word} `, textElement);
        Demo.populateMessages(textElement, messages, onClose, wordIndex + 1);
      } else {
        messages.finaliseStreamedMessage();
        onClose();
      }
    }, 70);
  }
}
