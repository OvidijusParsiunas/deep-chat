import {MessageContent} from '../../types/messages';
import {DeepChat} from '../../deepChat';

export class FireEvents {
  public static onNewMessage(deepChat: DeepChat, message: MessageContent, isInitial: boolean) {
    const updateBody = JSON.parse(JSON.stringify({message, isInitial}));
    deepChat.onNewMessage(updateBody);
    deepChat.dispatchEvent(new CustomEvent('new-message', {detail: updateBody}));
  }

  public static onRender(deepChat: DeepChat) {
    deepChat.onComponentRender();
    deepChat.dispatchEvent(new CustomEvent('render'));
  }
}
