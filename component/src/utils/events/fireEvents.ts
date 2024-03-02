import {FileMessageUtils} from '../../views/chat/messages/fileMessageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {DeepChat} from '../../deepChat';
import {Legacy} from '../legacy/legacy';

export class FireEvents {
  public static onMessage(deepChat: DeepChat, message: MessageContentI, isHistory: boolean) {
    const updateBody = JSON.parse(JSON.stringify({message, isHistory, isInitial: isHistory}));
    FileMessageUtils.reAddFileRefToObject(message, updateBody);
    deepChat.onMessage?.(updateBody);
    deepChat.dispatchEvent(new CustomEvent('message', {detail: updateBody}));
    Legacy.fireOnNewMessage(deepChat, updateBody);
  }

  public static onClearMessages(deepChat: DeepChat) {
    deepChat.onClearMessages?.();
    deepChat.dispatchEvent(new CustomEvent('clear-messages'));
  }

  public static onRender(deepChat: DeepChat) {
    deepChat.onComponentRender?.(deepChat);
    deepChat.dispatchEvent(new CustomEvent('render', {detail: deepChat}));
  }

  public static onError(deepChat: DeepChat, error: string) {
    deepChat.onError?.(error);
    deepChat.dispatchEvent(new CustomEvent('error', {detail: error}));
  }
}
