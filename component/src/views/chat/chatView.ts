import {ElementUtils} from '../../utils/element/elementUtils';
import {Websocket} from '../../utils/HTTP/websocket';
import {ServiceIO} from '../../services/serviceIO';
import {Messages} from './messages/messages';
import {DeepChat} from '../../deepChat';
import {Input} from './input/input';

export class ChatView {
  private static createElements(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerElement = document.createElement('div');
    containerElement.id = 'chat-view';
    const messages = new Messages(deepChat, serviceIO, panel);
    if (serviceIO.websocket) Websocket.createConnection(serviceIO, messages);
    const userInput = new Input(deepChat, messages, serviceIO, containerElement);
    ElementUtils.addElements(containerElement, messages.elementRef, userInput.elementRef);
    return containerElement;
  }

  public static render(deepChat: DeepChat, containerRef: HTMLElement, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerElement = ChatView.createElements(deepChat, serviceIO, panel);
    containerRef.replaceChildren(containerElement);
  }
}
