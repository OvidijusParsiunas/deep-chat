import {FileMessageUtils} from '../../views/chat/messages/utils/fileMessageUtils';
import {MessageContentI} from '../../types/messagesInternal';
import {DeepChat} from '../../deepChat';
import {Legacy} from '../legacy/legacy';

export class FireEvents {
  public static onMessage(deepChat: DeepChat, message: MessageContentI, isHistory: boolean) {
    const updateBody = JSON.parse(JSON.stringify({message, isHistory, isInitial: isHistory}));
    FileMessageUtils.reAddFileRefToObject(message, updateBody.message);
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

  public static onInput(deepChat: DeepChat, content: {text?: string; files?: File[]}, isUser: boolean) {
    const updateBody = JSON.parse(JSON.stringify({content, isUser}));
    if (content.files) {
      FileMessageUtils.reAddFileRefToObject({files: content.files?.map((file) => ({ref: file}))}, updateBody.content);
    }
    deepChat.onInput?.(updateBody);
    deepChat.dispatchEvent(new CustomEvent('input', {detail: updateBody}));
  }

  public static onError(deepChat: DeepChat, error: string) {
    deepChat.onError?.(error);
    deepChat.dispatchEvent(new CustomEvent('error', {detail: error}));
  }
}
