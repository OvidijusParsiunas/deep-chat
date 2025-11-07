import {DOWNWARDS_MODE_CLASS, UPWARDS_MODE_CLASS} from '../../utils/consts/classConstants';
import {OpenAIRealtimeIO} from '../../services/openAI/realtime/openAIRealtimeIO';
import {CREATE_ELEMENT} from '../../utils/consts/htmlConstants';
import {ElementUtils} from '../../utils/element/elementUtils';
import {Websocket} from '../../utils/HTTP/websocket';
import {ServiceIO} from '../../services/serviceIO';
import {Messages} from './messages/messages';
import {DeepChat} from '../../deepChat';
import {Input} from './input/input';

export class ChatView {
  private static createElements(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerEl = CREATE_ELEMENT();
    containerEl.id = 'chat-view';
    containerEl.classList.add(!deepChat.focusMode && deepChat.upwardsMode ? UPWARDS_MODE_CLASS : DOWNWARDS_MODE_CLASS);
    const messages = new Messages(deepChat, serviceIO, panel);
    if (serviceIO.websocket) Websocket.createConnection(serviceIO, messages);
    const userInput = new Input(deepChat, messages, serviceIO, containerEl);
    ElementUtils.addElements(containerEl, messages.elementRef, userInput.elementRef);
    return containerEl;
  }

  public static render(deepChat: DeepChat, containerRef: HTMLElement, serviceIO: ServiceIO, panel?: HTMLElement) {
    const containerElement = ChatView.createElements(deepChat, serviceIO, panel);
    containerRef.replaceChildren(containerElement);
    if (serviceIO.isCustomView()) (serviceIO as OpenAIRealtimeIO).setUpView(containerElement, containerRef);
  }
}
