import {Messages} from '../../views/chat/messages/messages';

type Finish = () => void;

export class Demo {
  public static readonly URL = 'ai-assistant-demo';
  private static readonly EXAMPLE_AI_MESSAGE = 'Hello I am a helpful assistant!';
  private static readonly EXAMPLE_AI_STREAMED_MESSAGE = 'How are you doing?'.split(' ');

  public static request(messages: Messages, onFinish: Finish) {
    setTimeout(() => {
      messages.addNewMessage({text: Demo.EXAMPLE_AI_MESSAGE}, true, true);
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
        messages.finaliseStreamedMessage(textElement.innerText);
        onClose();
      }
    }, 70);
  }
}
