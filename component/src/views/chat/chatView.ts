import {Messages} from './messages/messages';
import {Input} from './input/input';

// WORK - API to insert text
// WORK - emit result
// WORK - API to programmatically insert text - results to be able to continue the conversation
// WORK - if minified - show a notification bubble
export class ChatView {
  private static createElements(key: string) {
    const containerElement = document.createElement('div');
    containerElement.id = 'chat';
    const messages = new Messages(containerElement);
    const userInput = new Input(key, messages);
    containerElement.appendChild(userInput.elementRef);
    return containerElement;
  }

  public static render(containerRef: HTMLElement, key: string) {
    const containerElement = ChatView.createElements(key);
    containerRef.replaceChildren(containerElement);
  }
}
