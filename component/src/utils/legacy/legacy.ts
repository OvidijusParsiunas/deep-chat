import {MessageContent, MessageElementsStyles, MessageStyles, OnMessage} from '../../types/messages';
import {INSIDE_END, INSIDE_START, OUTSIDE_END, OUTSIDE_START} from '../consts/inputConstants';
import {BrowserStorage} from '../../views/chat/messages/browserStorage/browserStorage';
import {DOCS_BASE_URL, ERROR, FILE, FILES, TEXT} from '../consts/messageConstants';
import {FilesServiceConfig} from '../../types/fileServiceConfigs';
import {OBJECT} from '../../services/utils/serviceConstants';
import {CLASS_LIST, STYLE} from '../consts/htmlConstants';
import {ValidateInput} from '../../types/validateInput';
import {HTMLWrappers, Stream} from '../../types/stream';
import {MessageFile} from '../../types/messageFile';
import {FocusMode} from '../../types/focusMode';
import {CustomStyle} from '../../types/styles';
import {Connect} from '../../types/connect';
import {Cohere} from '../../types/cohere';
import {DeepChat} from '../../deepChat';
import {Demo} from '../../types/demo';

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
      Object.assign(containerRef[STYLE], containerStyle);
      console[ERROR](`The containerStyle property${IS_DEPRECATED}1.3.14.`);
      console[ERROR](`${PLEASE_CHANGE}the style property instead: ${DOCS_BASE_URL}styles#style`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static handleResponseProperty(result: any | Response) {
    console[ERROR](`The {result: ....} response object type${IS_DEPRECATED}1.3.0.`);
    console[ERROR](`${PLEASE_CHANGE}the new response object: ${DOCS_BASE_URL}connect#Response`);
    return result.result;
  }

  public static processHistory(deepChat: DeepChat) {
    const initialMessages = (deepChat as unknown as LegacyDeepChat).initialMessages;
    if (initialMessages) {
      console[ERROR](`The initialMessages property${IS_DEPRECATED}2.0.0.`);
      console[ERROR](`${PLEASE_CHANGE}the history property instead: ${DOCS_BASE_URL}messages/#history`);
      return initialMessages;
    }
    return undefined;
  }

  public static processHistoryFile(message: MessageContent) {
    const file = (message as MessageContent & {file?: MessageFile})[FILE];
    if (file) {
      console[ERROR](`The file property in MessageContent${IS_DEPRECATED}1.3.17.`);
      console[ERROR](`${PLEASE_CHANGE}the files array property: ${DOCS_BASE_URL}messages/#MessageContent`);
      message[FILES] = [file];
    }
  }

  public static processValidateInput(deepChat: DeepChat) {
    const validate = (deepChat as DeepChat & {validateMessageBeforeSending?: ValidateInput}).validateMessageBeforeSending;
    if (validate) {
      console[ERROR](`The validateMessageBeforeSending property${IS_DEPRECATED}1.3.24.`);
      console[ERROR](`${PLEASE_CHANGE}validateInput: ${DOCS_BASE_URL}interceptors#validateInput`);
      return validate;
    }
    return undefined;
  }

  public static processSubmitUserMessage(content: string) {
    console[ERROR](`The submitUserMessage(text: string) argument string type${IS_DEPRECATED}1.4.4.`);
    console[ERROR](`${PLEASE_CHANGE}the new argument type: ${DOCS_BASE_URL}methods#submitUserMessage`);
    return {[TEXT]: content};
  }

  public static flagHTMLUpdateClass(bubbleElement: HTMLElement) {
    if (bubbleElement.children[0]?.[CLASS_LIST].contains('deep-chat-update-message')) {
      console[ERROR](`The "deep-chat-update-message" html class${IS_DEPRECATED}1.4.4.`);
      console[ERROR](`${PLEASE_CHANGE}using {..., overwrite: true} object: ${DOCS_BASE_URL}connect#Response`);
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
      console[ERROR](`The request property${IS_DEPRECATED}2.0.0.`);
      console[ERROR](`${SEE}connect object: ${DOCS_BASE_URL}connect#connect-1`);
    }
  }

  public static checkForStream(deepChat: DeepChat) {
    const stream = (deepChat as unknown as LegacyDeepChat).stream;
    if (stream) {
      console[ERROR](`The stream property${MOVED_TO}the connect object in version 2.0.0.`);
      console[ERROR](`${SEE}connect object: ${DOCS_BASE_URL}connect#connect-1`);
      return stream;
    }
    return undefined;
  }

  public static fireOnNewMessage(deepChat: DeepChat, updateBody: {message: MessageContent; isHistory: boolean}) {
    const legacyDeepchat = deepChat as unknown as DeepChat & LegacyDeepChat;
    if (legacyDeepchat.onNewMessage) {
      console[ERROR](`The onNewMessage event${IS_DEPRECATED}2.0.0.`);
      console[ERROR](`${SEE}onMessage event: ${DOCS_BASE_URL}events#onMessage`);
      legacyDeepchat.onNewMessage?.(updateBody);
    }
    deepChat.dispatchEvent(new CustomEvent('new-message', {detail: updateBody}));
  }

  public static processFileConfigConnect(config: FilesServiceConfig) {
    const legacyConfig = config as unknown as FilesServiceConfig & {request?: Connect};
    if (legacyConfig.request) {
      console[ERROR](`The request property in file configuration${IS_DEPRECATED}2.0.0.`);
      console[ERROR](`Please use the connect property instead: ${DOCS_BASE_URL}files`);
      if (!legacyConfig.connect) legacyConfig.connect = legacyConfig.request;
    }
  }

  public static processMessageStyles(messageStyles?: MessageStyles) {
    if (!messageStyles) return;
    const messageStylesCp = JSON.parse(JSON.stringify(messageStyles));
    const loading = messageStylesCp.loading as unknown as MessageElementsStyles;
    if (loading && (loading.outerContainer || loading.innerContainer || loading.bubble || loading.media)) {
      console[ERROR](`The loading message styles are defined using LoadingMessageStyles interface${SINCE_VERSION}2.1.0.`);
      console[ERROR](`Check it out here: ${DOCS_BASE_URL}messages/styles#LoadingMessageStyles`);
      messageStylesCp.loading = {message: {styles: loading}};
    }
    return messageStylesCp;
  }

  public static processDemo(demo: Demo) {
    if (typeof demo === 'boolean') return demo;
    if ((demo as unknown as {displayLoadingBubble?: boolean}).displayLoadingBubble) {
      console[ERROR](`The demo displayLoadingBubble property${IS_DEPRECATED}2.1.0.`);
      console[ERROR](`Please use displayLoading instead: ${DOCS_BASE_URL}modes#demo`);
      demo.displayLoading = {message: true};
    }
    return demo;
  }

  public static processCohere(cohere: Cohere) {
    const cohereObj = cohere as unknown as {chat?: object; textGeneration?: object; summarization?: object};
    const documentationMsg = `${SEE}official documentation: ${DOCS_BASE_URL}directConnection/Cohere`;
    if (cohereObj.chat) {
      console[ERROR](`Cohere chat property${IS_DEPRECATED}2.2.3.`);
      console[ERROR](documentationMsg);
      delete cohereObj.chat;
    }
    if (cohereObj.textGeneration) {
      console[ERROR](`Cohere textGeneration${NOT_SUPPORTED_SINCE}2.2.3.`);
      console[ERROR](documentationMsg);
      delete cohereObj.textGeneration;
      return false;
    }
    if (cohereObj.summarization) {
      console[ERROR](`Cohere summarization${NOT_SUPPORTED_SINCE}2.2.3.`);
      console[ERROR](documentationMsg);
      delete cohereObj.summarization;
      return false;
    }
    return true;
  }

  public static processStreamHTMLWrappers(stream?: Stream) {
    if (!stream || typeof stream !== OBJECT) return;
    const htmlWrappers = (stream as {htmlWrappers?: HTMLWrappers}).htmlWrappers;
    if (htmlWrappers) {
      console[ERROR](`The htmlWrappers property${MOVED_TO}Deep Chat's base${SINCE_VERSION}2.3.0.`);
      console[ERROR](`Check it out here: ${DOCS_BASE_URL}messages/HTML#htmlWrappers`);
      return htmlWrappers;
    }
    return undefined;
  }

  public static processFocusMode(focusMode?: FocusMode) {
    if (!focusMode || typeof focusMode === 'boolean') return focusMode;
    const scroll = (focusMode as unknown as {scroll?: boolean}).scroll;
    if (scroll) {
      console[ERROR](`The scroll property in focusMode has been changed to smoothScroll${SINCE_VERSION}2.3.0.`);
      console[ERROR](`Check it out here: ${DOCS_BASE_URL}modes#focusMode`);
      focusMode.smoothScroll = true;
    }
    return focusMode;
  }

  public static processPosition<T>(buttonPosition?: string) {
    if (!buttonPosition) return buttonPosition as T;
    const error = `Position names have been updated${SINCE_VERSION}2.3.1.`;
    if (buttonPosition === 'inside-left') {
      console[ERROR](error);
      return INSIDE_START;
    }
    if (buttonPosition === 'inside-right') {
      console[ERROR](error);
      return INSIDE_END;
    }
    if (buttonPosition === 'outside-left') {
      console[ERROR](error);
      return OUTSIDE_START;
    }
    if (buttonPosition === 'outside-right') {
      console[ERROR](error);
      return OUTSIDE_END;
    }
    return buttonPosition as T;
  }

  public static processBrowserStorage(browserStorage: BrowserStorage) {
    const item = browserStorage.get();
    if (item && Array.isArray(item)) browserStorage.addMessages(item);
  }
}

// These are used to allow bundled to mangle names to reduce the bundle size
const SINCE_VERSION = ' since version ';
const IS_DEPRECATED = ` is deprecated ${SINCE_VERSION}`;
const PLEASE_CHANGE = 'Please change to using ';
const SEE = 'Please see the ';
const NOT_SUPPORTED_SINCE = ` is not supported ${SINCE_VERSION}`;
const MOVED_TO = ' has been moved to ';
