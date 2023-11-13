import {MessageContentI} from '../../types/messagesInternal';
import {DeepChat} from '../../deepChat';

export class FireEvents {
  public static onNewMessage(deepChat: DeepChat, message: MessageContentI, isInitial: boolean) {
    const updateBody = JSON.parse(JSON.stringify({message, isInitial}));
    deepChat.onNewMessage(updateBody);
    deepChat.dispatchEvent(new CustomEvent('new-message', {detail: updateBody}));
  }

  public static onClearMessages(deepChat: DeepChat) {
    deepChat.onClearMessages();
    deepChat.dispatchEvent(new CustomEvent('clear-messages'));
  }

  public static onRender(deepChat: DeepChat) {
    deepChat.onComponentRender();
    deepChat.dispatchEvent(new CustomEvent('render'));
  }
}
