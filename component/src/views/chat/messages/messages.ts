import {MessageBody, MessageContentI, Overwrite} from '../../../types/messagesInternal';
import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../utils/consts/htmlConstants';
import {HiddenFileAttachments} from '../input/fileAttachments/fileAttachments';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {CustomErrors, ServiceIO} from '../../../services/serviceIO';
import {IntroMessage, LoadingStyles} from '../../../types/messages';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {OBJECT} from '../../../services/utils/serviceConstants';
import {DEFAULT} from '../../../utils/consts/inputConstants';
import {FireEvents} from '../../../utils/events/fireEvents';
import {MessageStyleUtils} from './utils/messageStyleUtils';
import {ErrorMessageOverrides} from '../../../types/error';
import {LoadingToggleConfig} from '../../../types/loading';
import {ResponseI} from '../../../types/responseInternal';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {LoadingHistory} from './history/loadingHistory';
import {ErrorResp} from '../../../types/errorInternal';
import {Demo, DemoResponse} from '../../../types/demo';
import {MessageStream} from './stream/messageStream';
import {IntroPanel} from '../introPanel/introPanel';
import {WebModel} from '../../../webModel/webModel';
import {UpdateMessage} from './utils/updateMessage';
import {Legacy} from '../../../utils/legacy/legacy';
import {LoadHistory} from '../../../types/history';
import {MessageUtils} from './utils/messageUtils';
import {HTMLMessages} from './html/htmlMessages';
import {SetupMessages} from './setupMessages';
import {FileMessages} from './fileMessages';
import {MessagesBase} from './messagesBase';
import {DeepChat} from '../../../deepChat';
import {HTMLUtils} from './html/htmlUtils';
import {History} from './history/history';
import {
  ERROR_MESSAGE_TEXT_CLASS,
  SERVICE,
  FILES,
  ERROR,
  FILE,
  USER,
  TEXT,
  HTML,
  ANY,
  SRC,
  AI,
} from '../../../utils/consts/messageConstants';

export interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

// WORK - change setUp to setup
export class Messages extends MessagesBase {
  private readonly _errorMessageOverrides?: ErrorMessageOverrides;
  private readonly _onClearMessages?: () => void;
  private readonly _onError?: (error: string) => void;
  private readonly _isLoadingMessageAllowed?: boolean;
  private readonly _permittedErrorPrefixes?: CustomErrors;
  private readonly _displayServiceErrorMessages?: boolean;
  private _introMessage?: IntroMessage | IntroMessage[];
  private _hiddenAttachments?: HiddenFileAttachments;
  private _activeLoadingConfig?: LoadingToggleConfig;
  customDemoResponse?: DemoResponse;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    super(deepChat);
    const {permittedErrorPrefixes, demo} = serviceIO;
    this._errorMessageOverrides = deepChat.errorMessages?.overrides;
    this._onClearMessages = FireEvents.onClearMessages.bind(this, deepChat);
    this._onError = FireEvents.onError.bind(this, deepChat);
    this._isLoadingMessageAllowed = Messages.getDefaultDisplayLoadingMessage(deepChat, serviceIO) as boolean;
    if (typeof deepChat.displayLoadingBubble === 'object' && !!deepChat.displayLoadingBubble.toggle) {
      deepChat.displayLoadingBubble.toggle = this.setLoadingToggle.bind(this);
    }
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    if (!this.addSetupMessageIfNeeded(deepChat, serviceIO)) this.populateIntroPanel(panel);
    if (demo) this.prepareDemo(Legacy.processDemo(demo), deepChat.loadHistory); // before intro/history for loading spinner
    this.addIntroductoryMessages(deepChat, serviceIO);
    new History(deepChat, this, serviceIO);
    this._displayServiceErrorMessages = deepChat.errorMessages?.displayServiceErrorMessages;
    deepChat.getMessages = () => MessageUtils.deepCloneMessagesWithReferences(this.messageToElements.map(([msg]) => msg));
    deepChat.clearMessages = this.clearMessages.bind(this, serviceIO);
    deepChat.refreshMessages = this.refreshTextMessages.bind(this, deepChat.remarkable);
    deepChat.scrollToBottom = ElementUtils.scrollToBottom.bind(this, this);
    deepChat.addMessage = (message: ResponseI, isUpdate?: boolean) => {
      this.addAnyMessage({...message, sendUpdate: !!isUpdate}, !isUpdate);
    };
    deepChat.updateMessage = (messageBody: MessageBody, index: number) => UpdateMessage.update(this, messageBody, index);
    if (serviceIO.isWebModel()) (serviceIO as WebModel).setUpMessages(this);
    if (deepChat.textToSpeech) {
      TextToSpeech.processConfig(deepChat.textToSpeech, (processedConfig) => {
        this.textToSpeech = processedConfig;
      });
    }
  }

  private static getDefaultDisplayLoadingMessage(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (typeof deepChat.displayLoadingBubble === 'object' && !!deepChat.displayLoadingBubble.toggle) {
      return false;
    }
    if (serviceIO.websocket) {
      return typeof deepChat.displayLoadingBubble === OBJECT ? false : !!deepChat.displayLoadingBubble;
    }
    // if displayLoadingBubble is {} then treat it as true.
    return (typeof deepChat.displayLoadingBubble === OBJECT || deepChat.displayLoadingBubble) ?? true;
  }

  private setLoadingToggle(config?: LoadingToggleConfig) {
    const lastMessageEls = this.messageElementRefs[this.messageElementRefs.length - 1];
    const isLoadingMessage = MessagesBase.isLoadingMessage(lastMessageEls);
    if (!config && isLoadingMessage) {
      this.removeLastMessage();
      delete this._activeLoadingConfig;
    } else {
      if (this._activeLoadingConfig && isLoadingMessage) {
        const targetWrapper = HTMLUtils.getTargetWrapper(lastMessageEls.bubbleElement);
        if (targetWrapper) {
          this._activeLoadingConfig = config || {};
          return this.updateLoadingMessage(targetWrapper);
        }
        this.removeLastMessage();
      }
      this._activeLoadingConfig = config || {};
      this.addLoadingMessage(true);
    }
  }

  private prepareDemo(demo: Demo, loadHistory?: LoadHistory): void {
    if (typeof demo === 'object') {
      if (!loadHistory && demo.displayLoading) {
        const {history} = demo.displayLoading;
        if (history?.small) LoadingHistory.addMessage(this, false);
        if (history?.full) LoadingHistory.addMessage(this);
      }
      if (demo.displayErrors) {
        if (demo.displayErrors[DEFAULT]) this.addNewErrorMessage('' as 'service', '');
        if (demo.displayErrors.service) this.addNewErrorMessage(SERVICE, '');
        if (demo.displayErrors.speechToText) this.addNewErrorMessage('speechToText', '');
      }
      // needs to be here for message loading bubble to not disappear after error
      if (demo.displayLoading?.message) this.addLoadingMessage();
      if (demo.response) this.customDemoResponse = demo.response;
    }
  }

  private addSetupMessageIfNeeded(deepChat: DeepChat, serviceIO: ServiceIO) {
    const text = SetupMessages.getText(deepChat, serviceIO);
    if (text) {
      const elements = this.createAndAppendNewMessageElement(text, AI);
      this.applyCustomStyles(elements, AI, false);
    }
    return !!text;
  }

  // WORK - const file for deep chat classes
  private addIntroductoryMessages(deepChat?: DeepChat, serviceIO?: ServiceIO) {
    if (deepChat?.shadowRoot) this._introMessage = deepChat.introMessage;
    let introMessage = this._introMessage;
    if (serviceIO?.isWebModel()) introMessage ??= (serviceIO as WebModel).getIntroMessage(introMessage);
    const shouldHide = !deepChat?.history && !!(deepChat?.loadHistory || serviceIO?.fetchHistory);
    if (introMessage) {
      if (Array.isArray(introMessage)) {
        introMessage.forEach((intro, index) => {
          if (index !== 0) {
            const innerContainer = this.messageElementRefs[this.messageElementRefs.length - 1].innerContainer;
            MessageUtils.hideRoleElements(innerContainer, this.avatar, this.name);
          }
          this.addIntroductoryMessage(intro, shouldHide);
        });
      } else {
        this.addIntroductoryMessage(introMessage, shouldHide);
      }
    }
  }

  private addIntroductoryMessage(introMessage: IntroMessage, shouldHide: boolean) {
    let elements;
    if (introMessage?.[TEXT]) {
      elements = this.createAndAppendNewMessageElement(introMessage[TEXT], AI);
    } else if (introMessage?.[HTML]) {
      elements = HTMLMessages.add(this, introMessage[HTML], AI);
    }
    if (elements) {
      this.applyCustomStyles(elements, AI, false, this.messageStyles?.intro);
      elements.outerContainer[CLASS_LIST].add(MessagesBase.INTRO_CLASS);
      if (shouldHide) elements.outerContainer[STYLE].display = 'none';
    }
    return elements;
  }

  public removeIntroductoryMessage() {
    const introMessage = this.messageElementRefs[0];
    if (introMessage.outerContainer[CLASS_LIST].contains(MessagesBase.INTRO_CLASS)) {
      introMessage.outerContainer.remove();
      this.messageElementRefs.shift();
    }
  }

  public addAnyMessage(message: ResponseI, isHistory = false, isTop = false) {
    if (message[ERROR]) {
      return this.addNewErrorMessage(SERVICE, message[ERROR], isTop);
    }
    return this.addNewMessage(message, isHistory, isTop);
  }

  private tryAddTextMessage(msg: MessageContentI, overwrite: Overwrite, data: ResponseI, history = false, isTop = false) {
    if (msg[TEXT] !== undefined && data[TEXT] !== null) {
      this.addNewTextMessage(msg[TEXT], msg.role, overwrite, isTop);
      if (!history && this.textToSpeech && msg.role !== USER) {
        TextToSpeech.speak(msg[TEXT], this.textToSpeech);
      }
    }
  }

  private tryAddFileMessages(message: MessageContentI, isScrollAtBottom: boolean, isTop = false) {
    if (message[FILES] && Array.isArray(message[FILES])) {
      FileMessages.addMessages(this, message[FILES], message.role, isScrollAtBottom, isTop);
    }
  }

  private tryAddHTMLMessage(message: MessageContentI, overwrite: Overwrite, isTop = false) {
    if (message[HTML] !== undefined && message[HTML] !== null) {
      const elements = HTMLMessages.add(this, message[HTML], message.role, overwrite, isTop);
      if (!isTop && HTMLDeepChatElements.isElementTemporary(elements)) delete message[HTML];
    }
  }

  // this should not be activated by streamed messages
  public addNewMessage(data: ResponseI, isHistory = false, isTop = false) {
    if (data.role !== USER) this._hiddenAttachments?.removeHiddenFiles();
    const message = Messages.createMessageContent(data);
    const displayText = this.textToSpeech?.audio?.displayText;
    if (typeof displayText === 'boolean' && !displayText) delete message[TEXT];
    const isScrollAtBottom = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    const overwrite: Overwrite = {status: data.overwrite}; // if did not overwrite, create a new message
    if (isTop) {
      this.tryAddFileMessages(message, isScrollAtBottom, isTop);
      this.tryAddHTMLMessage(message, overwrite, isTop);
      this.tryAddTextMessage(message, overwrite, data, isHistory, isTop);
    } else {
      this.tryAddTextMessage(message, overwrite, data, isHistory, isTop);
      this.tryAddHTMLMessage(message, overwrite, isTop);
      this.tryAddFileMessages(message, isScrollAtBottom, isTop);
    }
    if (this.isValidMessageContent(message) && !isTop) {
      this.updateStateOnMessage(message, data.overwrite, data.sendUpdate, isHistory);
      // in timeout for it to move to the loading bubble and when bubble font is large
      if (!overwrite.status) setTimeout(() => this.scrollToFirstElement(message.role, isScrollAtBottom));
      if (!isHistory) this.browserStorage?.addMessages(this.messageToElements.map(([msg]) => msg));
      if (this.hiddenMessages && message.role !== USER) this.tryUpdateHiddenMessageCount(isHistory, data);
    }
    if (this._activeLoadingConfig) this.addLoadingMessage(false);
    return message;
  }

  private tryUpdateHiddenMessageCount(isHistory: boolean, data: ResponseI) {
    // isTop, isHistory, data.sendUpdate
    // load history
    // true true true -> should be false
    // history
    // false true undefined -> should be false
    // new response
    // false false undefined -> should be true
    // addMessage
    // false true false -> should be true
    // addMessage
    // false false false -> should be true
    if (!isHistory || data.sendUpdate !== undefined) {
      // in timeout as above scrollToFirstElement is also in timeout
      setTimeout(() => this.hiddenMessages?.update?.());
    }
  }

  private isValidMessageContent(messageContent: MessageContentI) {
    return messageContent[TEXT] || messageContent[HTML] || (messageContent[FILES] && messageContent[FILES].length > 0);
  }

  private updateStateOnMessage(messageContent: MessageContentI, overwritten?: boolean, update = true, isHistory = false) {
    if (!overwritten) {
      const messageBody = MessageUtils.generateMessageBody(messageContent, this.messageElementRefs);
      this.messageToElements.push([messageContent, messageBody]);
    }
    if (update) this.sendClientUpdate(messageContent, isHistory);
  }

  // prettier-ignore
  private removeMessageOnError() {
    const lastMessage = this.messageElementRefs[this.messageElementRefs.length - 1];
    const lastMessageBubble = lastMessage?.bubbleElement;
    if ((lastMessageBubble?.[CLASS_LIST].contains(MessageStream.MESSAGE_CLASS) && lastMessageBubble.textContent === '') ||
        Messages.isTemporaryElement(lastMessage)) {
      this.removeLastMessage();
    }
  }

  // prettier-ignore
  public addNewErrorMessage(type: keyof Omit<ErrorMessageOverrides, 'default'>, message?: ErrorResp, isTop = false) {
    this._hiddenAttachments?.readdHiddenFiles();
    this.removeMessageOnError();
    const text = this.getPermittedMessage(message) || this._errorMessageOverrides?.[type]
      || this._errorMessageOverrides?.[DEFAULT] || 'Error, please try again.';
    const messageElements = this.createMessageElementsOnOrientation(text, ERROR, isTop);
    MessageUtils.hideRoleElements(messageElements.innerContainer, this.avatar, this.name);
    const {bubbleElement, outerContainer} = messageElements;
    bubbleElement[CLASS_LIST].add(ERROR_MESSAGE_TEXT_CLASS);
    this.renderText(bubbleElement, text);
    const fontElementStyles = MessageStyleUtils.extractParticularSharedStyles(['fontSize', 'fontFamily'],
      this.messageStyles?.[DEFAULT]);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, fontElementStyles);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, this.messageStyles?.[ERROR]);
    if (!isTop) this.appendOuterContainerElemet(outerContainer);
    if (this.textToSpeech) TextToSpeech.speak(text, this.textToSpeech);
    this._onError?.(text);
    setTimeout(() => ElementUtils.scrollToBottom(this)); // timeout neeed when bubble font is large
  }

  private static checkPermittedErrorPrefixes(errorPrefixes: string[], message: string): string | undefined {
    for (let i = 0; i < errorPrefixes.length; i += 1) {
      if (message.startsWith(errorPrefixes[i])) return message;
    }
    return undefined;
  }

  private static extractErrorMessages(message: ErrorResp): string[] {
    if (Array.isArray(message)) {
      return message;
    }
    if (message instanceof Error) {
      return [message.message];
    }
    if (typeof message === 'string') {
      return [message];
    }
    if (typeof message === 'object' && message[ERROR]) {
      return [message[ERROR]];
    }
    return [];
  }

  private getPermittedMessage(message?: ErrorResp): string | undefined {
    if (message) {
      const messages = Messages.extractErrorMessages(message); // turning all into array for convenience
      for (let i = 0; i < messages.length; i += 1) {
        const messageStr = messages[i];
        if (typeof messageStr === 'string') {
          if (this._displayServiceErrorMessages) return messageStr;
          if (this._permittedErrorPrefixes) {
            const result = Messages.checkPermittedErrorPrefixes(this._permittedErrorPrefixes, messageStr);
            if (result) return result;
          }
        }
      }
    }
    return undefined;
  }

  public removeError() {
    if (this.isLastMessageError()) MessageUtils.getLastMessageElement(this.elementRef).remove();
  }

  private addDefaultLoadingMessage(styles?: LoadingStyles, role = AI) {
    const messageElements = this.createMessageElements('', role);
    const {bubbleElement} = messageElements;
    messageElements.bubbleElement[CLASS_LIST].add(LoadingStyle.DOTS_CONTAINER_CLASS);
    const dotsElement = CREATE_ELEMENT();
    dotsElement[CLASS_LIST].add('loading-message-dots');
    bubbleElement.appendChild(dotsElement);
    LoadingStyle.setDots(bubbleElement, styles);
    return messageElements;
  }

  // prettier-ignore
  public addLoadingMessage(override = false) {
    if (MessagesBase.isLoadingMessage(this.messageElementRefs[this.messageElementRefs.length - 1]) ||
      (!this._activeLoadingConfig && !override && !this._isLoadingMessageAllowed)) return;
    const role = this._activeLoadingConfig?.role || AI;
    const style = this._activeLoadingConfig?.[STYLE] || this.messageStyles?.loading?.message;
    const html = style?.[HTML];
    const messageElements = html
      ? HTMLMessages.createElements(this, html, role, false)
      : this.addDefaultLoadingMessage(style, role);
    this.appendOuterContainerElemet(messageElements.outerContainer);
    messageElements.bubbleElement[CLASS_LIST].add(LoadingStyle.BUBBLE_CLASS);
    this.applyCustomStyles(messageElements, role, false, style?.styles);
    this.avatar?.getAvatarContainer(messageElements.innerContainer)?.[CLASS_LIST].add('loading-avatar-container');
    const allowScroll = !this.focusMode && ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    if (allowScroll) ElementUtils.scrollToBottom(this);
  }

  // this is a special method not to constantly refresh loading animations
  private updateLoadingMessage(wrapper: HTMLElement) {
    const style = this._activeLoadingConfig?.[STYLE];
    const html = style?.[HTML];
    wrapper.innerHTML = html || '';
  }

  private populateIntroPanel(childElement?: HTMLElement) {
    if (childElement) {
      this._introPanel = new IntroPanel(childElement);
      HTMLUtils.apply(this, this._introPanel._elementRef);
      this.elementRef.appendChild(this._introPanel._elementRef);
    }
  }

  public async addMultipleFiles(filesData: {file: File; type: MessageFileType}[], hiddenAtts: HiddenFileAttachments) {
    this._hiddenAttachments = hiddenAtts;
    return Promise.all<MessageFile>(
      (filesData || []).map((fileData) => {
        return new Promise((resolve) => {
          if (!fileData.type || fileData.type === ANY) {
            const name = fileData[FILE].name || FILE;
            resolve({name, type: ANY, ref: fileData[FILE]});
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(fileData[FILE]);
            reader.onload = () => {
              const name = fileData[FILE].name;
              resolve({[SRC]: reader.result as string, name, type: fileData.type, ref: fileData[FILE]});
            };
          }
        });
      })
    );
  }

  public static isActiveElement(bubbleClasslist?: DOMTokenList) {
    if (!bubbleClasslist) return false;
    return (
      bubbleClasslist.contains(LoadingStyle.BUBBLE_CLASS) ||
      bubbleClasslist.contains(LoadingHistory.CLASS) ||
      bubbleClasslist.contains(MessageStream.MESSAGE_CLASS)
    );
  }

  // WORK - update all message classes to use deep-chat prefix
  private clearMessages(serviceIO: ServiceIO, isReset?: boolean) {
    const retainedElements: MessageElements[] = [];
    this.messageElementRefs.forEach((message) => {
      if (Messages.isActiveElement(message.bubbleElement[CLASS_LIST])) {
        retainedElements.push(message);
      } else {
        message.outerContainer.remove();
      }
    });
    // this is a form of cleanup as this.messageElementRefs does not contain error messages
    // and can only be deleted by direct search
    Array.from(this.elementRef.children).forEach((messageElement) => {
      const bubbleClasslist = messageElement.children[0]?.children[0];
      if (bubbleClasslist?.[CLASS_LIST].contains(ERROR_MESSAGE_TEXT_CLASS)) {
        messageElement.remove();
      }
    });
    this.messageElementRefs = retainedElements;
    const retainedMessageToElements = this.messageToElements.filter((msgToEls) => {
      // safe because streamed messages can't contain multiple props (text, html)
      return (
        (msgToEls[1][TEXT] && Messages.isActiveElement(msgToEls[1][TEXT].bubbleElement[CLASS_LIST])) ||
        (msgToEls[1][HTML] && Messages.isActiveElement(msgToEls[1][HTML].bubbleElement[CLASS_LIST]))
      );
    });
    this.messageToElements.splice(0, this.messageToElements.length, ...retainedMessageToElements);
    if (isReset !== false) {
      if (this._introPanel?._elementRef) this._introPanel.display();
      this.addIntroductoryMessages();
    }
    this.browserStorage?.clear();
    this.hiddenMessages?.clear();
    this._onClearMessages?.();
    delete serviceIO.sessionId;
  }
}
