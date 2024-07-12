import {FilesServiceConfig} from '../../types/fileServiceConfigs';
import {MessageContent, OnMessage} from '../../types/messages';
import {ValidateInput} from '../../types/validateInput';
import {MessageFile} from '../../types/messageFile';
import {CustomStyle} from '../../types/styles';
import {Connect} from '../../types/connect';
import {Stream} from '../../types/stream';
import {DeepChat} from '../../deepChat';

interface LegacyDeepChat {
  request?: Connect;
  stream?: Stream;
  initialMessages?: MessageContent[];
  containerStyle?: CustomStyle;
  onNewMessage?: OnMessage;
}

export class Legacy {
  public static checkForContainerStyles(deepChat: DeepChat, containerRef: HTMLElement) {
    const containerStyle = (deepChat as unknown as LegacyDeepChat).containerStyle;
    if (containerStyle) {
      Object.assign(containerRef.style, containerStyle);
      console.error('The containerStyle property is deprecated since version 1.3.14.');
      console.error('Please change to using the style property instead: https://deepchat.dev/docs/styles#style');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static handleResponseProperty(result: any | Response) {
    console.error('The {result: ....} response object type is deprecated since version 1.3.0.');
    console.error('Please change to using the new response object: https://deepchat.dev/docs/connect#Response');
    return result.result;
  }

  public static processHistory(deepChat: DeepChat) {
    const initialMessages = (deepChat as unknown as LegacyDeepChat).initialMessages;
    if (initialMessages) {
      console.error('The initialMessages property is deprecated since version 2.0.0.');
      console.error('Please change to using the history property instead: https://deepchat.dev/docs/messages/#history');
      return initialMessages;
    }
    return undefined;
  }

  public static processHistoryFile(message: MessageContent) {
    const file = (message as MessageContent & {file?: MessageFile}).file;
    if (file) {
      console.error('The file property in MessageContent is deprecated since version 1.3.17.');
      console.error('Please change to using the files array property: https://deepchat.dev/docs/messages/#MessageContent');
      message.files = [file];
    }
  }

  public static processValidateInput(deepChat: DeepChat) {
    const validate = (deepChat as DeepChat & {validateMessageBeforeSending?: ValidateInput}).validateMessageBeforeSending;
    if (validate) {
      console.error('The validateMessageBeforeSending property is deprecated since version 1.3.24.');
      console.error('Please change to using validateInput: https://deepchat.dev/docs/interceptors#validateInput');
      return validate;
    }
    return undefined;
  }

  public static processSubmitUserMessage(content: string) {
    console.error('The submitUserMessage(text: string) argument string type is deprecated since version 1.4.4.');
    console.error('Please change to using the new argument type: https://deepchat.dev/docs/methods#submitUserMessage');
    return {text: content};
  }

  public static flagHTMLUpdateClass(bubbleElement: HTMLElement) {
    if (bubbleElement.children[0]?.classList.contains('deep-chat-update-message')) {
      console.error('The "deep-chat-update-message" html class is deprecated since version 1.4.4.');
      console.error('Please change to using {..., overwrite: true} object: https://deepchat.dev/docs/connect#Response');
    }
  }

  public static processConnect(deepChat: DeepChat) {
    const legacyDeepchat = deepChat as unknown as DeepChat & LegacyDeepChat;
    if (legacyDeepchat.request) {
      if (legacyDeepchat.connect) {
        Object.assign(legacyDeepchat.connect, legacyDeepchat.request);
      } else {
        // this will cause the component to render twice but it is needed
        legacyDeepchat.connect = legacyDeepchat.request;
      }
      console.error('The request property is deprecated since version 2.0.0.');
      console.error('Please see the connect object: https://deepchat.dev/docs/connect#connect-1');
    }
  }

  public static checkForStream(deepChat: DeepChat) {
    const stream = (deepChat as unknown as LegacyDeepChat).stream;
    if (stream) {
      console.error('The stream property has been moved to the connect object in version 2.0.0.');
      console.error('Please see the connect object: https://deepchat.dev/docs/connect#connect-1');
      return stream;
    }
    return undefined;
  }

  public static fireOnNewMessage(deepChat: DeepChat, updateBody: {message: MessageContent; isHistory: boolean}) {
    const legacyDeepchat = deepChat as unknown as DeepChat & LegacyDeepChat;
    if (legacyDeepchat.onNewMessage) {
      console.error('The onNewMessage event has been deprecated since version 2.0.0.');
      console.error('Please see the onMessage event: https://deepchat.dev/docs/events#onMessage');
      legacyDeepchat.onNewMessage?.(updateBody);
    }
    deepChat.dispatchEvent(new CustomEvent('new-message', {detail: updateBody}));
  }

  public static processFileConfigConnect(config: FilesServiceConfig) {
    const legacyConfig = config as unknown as FilesServiceConfig & {request?: Connect};
    if (legacyConfig.request) {
      console.error('The request property in file configuration is deprecated since version 2.0.0.');
      console.error('Please use the connect property instead: https://deepchat.dev/docs/files');
      if (!legacyConfig.connect) legacyConfig.connect = legacyConfig.request;
    }
  }
}
