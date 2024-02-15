import {ValidateInput} from '../../types/validateInput';
import {MessageContent} from '../../types/messages';
import {MessageFile} from '../../types/messageFile';
import {CustomStyle} from '../../types/styles';
import {Stream} from '../../types/stream';
import {DeepChat} from '../../deepChat';

interface LegacyDeepChat {
  containerStyle: CustomStyle;
  stream: Stream;
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

  public static processInitialMessageFile(message: MessageContent) {
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

  public static checkForStream(deepChat: DeepChat) {
    const stream = (deepChat as unknown as LegacyDeepChat).stream;
    if (stream) {
      console.error('The stream property has been moved to the request object in version 1.4.12.');
      console.error('Please see the thew request object: https://deepchat.dev/docs/connect#request');
      return stream;
    }
    return undefined;
  }
}
