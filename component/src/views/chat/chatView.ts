import {ElementUtils} from '../../utils/element/elementUtils';
import {ServiceIO} from '../../services/serviceIO';
import {AiAssistant} from '../../aiAssistant';
import {Messages} from './messages/messages';
import {Input} from './input/input';

export class ChatView {
  private static createElements(aiAssistant: AiAssistant, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerElement = document.createElement('div');
    containerElement.id = 'chat-view';
    const messages = new Messages(aiAssistant, serviceIO, panel);
    const userInput = new Input(aiAssistant, messages, serviceIO, containerElement);
    ElementUtils.addElements(containerElement, messages.elementRef, userInput.elementRef);
    return containerElement;
  }

  public static render(aiAssistant: AiAssistant, containerRef: HTMLElement, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerElement = ChatView.createElements(aiAssistant, serviceIO, panel);
    containerRef.replaceChildren(containerElement);
  }
}
