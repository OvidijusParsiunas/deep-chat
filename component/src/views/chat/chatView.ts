import {ElementUtils} from '../../utils/element/elementUtils';
import {AiAssistant} from '../../aiAssistant';
import {Messages} from './messages/messages';
import {Input} from './input/input';

export class ChatView {
  private static createElements(key: string, aiAssistant: AiAssistant) {
    const containerElement = document.createElement('div');
    containerElement.id = 'chat';
    const messages = new Messages(aiAssistant);
    const userInput = new Input(messages, key, aiAssistant);
    ElementUtils.addElements(containerElement, messages.elementRef, userInput.elementRef);
    return containerElement;
  }

  public static render(containerRef: HTMLElement, key: string, aiAssistant: AiAssistant) {
    const containerElement = ChatView.createElements(key, aiAssistant);
    containerRef.replaceChildren(containerElement);
  }

  public static shouldBeRendered(aiAssistant: AiAssistant) {
    return aiAssistant.startWithChatView || aiAssistant.apiKey;
  }
}
