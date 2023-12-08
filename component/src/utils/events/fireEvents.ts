import {FileMessageUtils} from '../../views/chat/messages/fileMessageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {DeepChat} from '../../deepChat';

export class FireEvents {
  public static onNewMessage(deepChat: DeepChat, message: MessageContentI, isInitial: boolean) {
    const updateBody = JSON.parse(JSON.stringify({message, isInitial}));
    FileMessageUtils.reAddFileRefToObject(message, updateBody);
    deepChat.onNewMessage(updateBody);
    deepChat.dispatchEvent(new CustomEvent('new-message', {detail: updateBody}));
  }

  public static onClearMessages(deepChat: DeepChat) {
    deepChat.onClearMessages();
    deepChat.dispatchEvent(new CustomEvent('clear-messages'));
  }

  public static onRender(deepChat: DeepChat) {
    deepChat.onComponentRender(deepChat);
    deepChat.dispatchEvent(new CustomEvent('render'));
  }

  public static onError(deepChat: DeepChat, error: string) {
    deepChat.onError(error);
    deepChat.dispatchEvent(new CustomEvent('error', {detail: error}));
  }
}
