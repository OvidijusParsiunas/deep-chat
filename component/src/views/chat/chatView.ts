import {AiAssistant} from '../../AiAssistant';
import {Messages} from './messages/messages';
import {Input} from './input/input';

// TO-DO - if minified - show a notification bubble
export class ChatView {
  private static createElements(key: string, aiAssistant: AiAssistant) {
    const containerElement = document.createElement('div');
    containerElement.id = 'chat';
    const messages = new Messages(containerElement, aiAssistant);
    const userInput = new Input(messages, key, aiAssistant);
    containerElement.appendChild(userInput.elementRef);
    return containerElement;
  }

  public static render(containerRef: HTMLElement, key: string, aiAssistant: AiAssistant) {
    const containerElement = ChatView.createElements(key, aiAssistant);
    containerRef.replaceChildren(containerElement);
  }
}
