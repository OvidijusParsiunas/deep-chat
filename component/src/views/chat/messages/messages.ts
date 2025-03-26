import {MessageBody, MessageContentI, Overwrite} from '../../../types/messagesInternal';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {CustomErrors, ServiceIO} from '../../../services/serviceIO';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {FireEvents} from '../../../utils/events/fireEvents';
import {MessageStyleUtils} from './utils/messageStyleUtils';
import {ErrorMessageOverrides} from '../../../types/error';
import {ResponseI} from '../../../types/responseInternal';
import {FileMessageUtils} from './utils/fileMessageUtils';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {LoadingHistory} from './history/loadingHistory';
import {ErrorResp} from '../../../types/errorInternal';
import {Demo, DemoResponse} from '../../../types/demo';
import {IntroMessage} from '../../../types/messages';
import {MessageStream} from './stream/messageStream';
import {IntroPanel} from '../introPanel/introPanel';
import {WebModel} from '../../../webModel/webModel';
import {UpdateMessage} from './utils/updateMessage';
import {Legacy} from '../../../utils/legacy/legacy';
import {LoadHistory} from '../../../types/history';
import {CustomStyle} from '../../../types/styles';
import {MessageUtils} from './utils/messageUtils';
import {HTMLMessages} from './html/htmlMessages';
import {SetupMessages} from './setupMessages';
import {FileMessages} from './fileMessages';
import {MessagesBase} from './messagesBase';
import {DeepChat} from '../../../deepChat';
import {HTMLUtils} from './html/htmlUtils';
import {History} from './history/history';

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
  customDemoResponse?: DemoResponse;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    super(deepChat);
    const {permittedErrorPrefixes, introPanelMarkUp, demo} = serviceIO;
    this._errorMessageOverrides = deepChat.errorMessages?.overrides;
    this._onClearMessages = FireEvents.onClearMessages.bind(this, deepChat);
    this._onError = FireEvents.onError.bind(this, deepChat);
    this._isLoadingMessageAllowed = Messages.getDefaultDisplayLoadingMessage(deepChat, serviceIO);
    if (typeof deepChat.displayLoadingBubble === 'object' && !!deepChat.displayLoadingBubble.toggle) {
      deepChat.displayLoadingBubble.toggle = this.setLoadingToggle.bind(this);
    }
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    if (!this.addSetupMessageIfNeeded(deepChat, serviceIO)) {
      this.populateIntroPanel(panel, introPanelMarkUp, deepChat.introPanelStyle);
    }
    if (demo) this.prepareDemo(Legacy.processDemo(demo), deepChat.loadHistory); // before intro/history for loading spinner
    this.addIntroductoryMessages(deepChat, serviceIO);
    new History(deepChat, this, serviceIO);
    this._displayServiceErrorMessages = deepChat.errorMessages?.displayServiceErrorMessages;
    deepChat.getMessages = () => JSON.parse(JSON.stringify(this.messageToElements.map(([msg]) => msg)));
    deepChat.clearMessages = this.clearMessages.bind(this, serviceIO);
    deepChat.refreshMessages = this.refreshTextMessages.bind(this, deepChat.remarkable);
    deepChat.scrollToBottom = ElementUtils.scrollToBottom.bind(this, this.elementRef);
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
    // if displayLoadingBubble is {} then treat it as true.
    if (serviceIO.websocket) {
      return !!deepChat.displayLoadingBubble;
    }
    return (typeof deepChat.displayLoadingBubble === 'object' || deepChat.displayLoadingBubble) ?? true;
  }

  private setLoadingToggle() {
    const lastMessageEls = this.messageElementRefs[this.messageElementRefs.length - 1];
    if (MessagesBase.isLoadingMessage(lastMessageEls)) {
      this.removeLastMessage();
    } else {
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
        if (demo.displayErrors.default) this.addNewErrorMessage('' as 'service', '');
        if (demo.displayErrors.service) this.addNewErrorMessage('service', '');
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
      const elements = this.createAndAppendNewMessageElement(text, MessageUtils.AI_ROLE);
      this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false);
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
    if (introMessage?.text) {
      elements = this.createAndAppendNewMessageElement(introMessage.text, MessageUtils.AI_ROLE);
    } else if (introMessage?.html) {
      elements = HTMLMessages.add(this, introMessage.html, MessageUtils.AI_ROLE);
    }
    if (elements) {
      this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false, this.messageStyles?.intro);
      elements.outerContainer.classList.add(MessagesBase.INTRO_CLASS);
      if (shouldHide) elements.outerContainer.style.display = 'none';
    }
    return elements;
  }

  public removeIntroductoryMessage() {
    const introMessage = this.messageElementRefs[0];
    if (introMessage.outerContainer.classList.contains(MessagesBase.INTRO_CLASS)) {
      introMessage.outerContainer.remove();
      this.messageElementRefs.shift();
    }
  }

  public addAnyMessage(message: ResponseI, isHistory = false, isTop = false) {
    if (message.error) {
      return this.addNewErrorMessage('service', message.error, isTop);
    }
    return this.addNewMessage(message, isHistory, isTop);
  }

  private tryAddTextMessage(msg: MessageContentI, overwrite: Overwrite, data: ResponseI, history = false, isTop = false) {
    if (!data.ignoreText && msg.text !== undefined && data.text !== null) {
      this.addNewTextMessage(msg.text, msg.role, overwrite, isTop);
      if (!history && this.textToSpeech && msg.role !== MessageUtils.USER_ROLE) {
        TextToSpeech.speak(msg.text, this.textToSpeech);
      }
    }
  }

  private tryAddFileMessages(message: MessageContentI, isTop = false) {
    if (message.files && Array.isArray(message.files)) {
      FileMessages.addMessages(this, message.files, message.role, isTop);
    }
  }

  private tryAddHTMLMessage(message: MessageContentI, overwrite: Overwrite, isTop = false) {
    if (message.html !== undefined && message.html !== null) {
      const elements = HTMLMessages.add(this, message.html, message.role, overwrite, isTop);
      if (isTop && HTMLDeepChatElements.isElementTemporary(elements)) delete message.html;
    }
  }

  // this should not be activated by streamed messages
  public addNewMessage(data: ResponseI, isHistory = false, isTop = false) {
    const message = Messages.createMessageContent(data);
    const overwrite: Overwrite = {status: data.overwrite}; // if did not overwrite, create a new message
    if (isTop) {
      this.tryAddHTMLMessage(message, overwrite, isTop);
      this.tryAddFileMessages(message, isTop);
      this.tryAddTextMessage(message, overwrite, data, isHistory, isTop);
    } else {
      this.tryAddTextMessage(message, overwrite, data, isHistory, isTop);
      this.tryAddFileMessages(message, isTop);
      this.tryAddHTMLMessage(message, overwrite, isTop);
    }
    if (this.isValidMessageContent(message) && !isTop) {
      this.updateStateOnMessage(message, data.overwrite, data.sendUpdate, isHistory);
    }
    return message;
  }

  private isValidMessageContent(messageContent: MessageContentI) {
    return messageContent.text || messageContent.html || (messageContent.files && messageContent.files.length > 0);
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
    if ((lastMessageBubble?.classList.contains(MessageStream.MESSAGE_CLASS) && lastMessageBubble.textContent === '') ||
        Messages.isTemporaryElement(lastMessage)) {
      this.removeLastMessage();
    }
  }

  // prettier-ignore
  public addNewErrorMessage(type: keyof Omit<ErrorMessageOverrides, 'default'>, message?: ErrorResp, isTop = false) {
    this.removeMessageOnError();
    const text = this.getPermittedMessage(message) || this._errorMessageOverrides?.[type]
      || this._errorMessageOverrides?.default || 'Error, please try again.';
    const messageElements = this.createMessageElementsOnOrientation(text, 'error', isTop);
    MessageUtils.hideRoleElements(messageElements.innerContainer, this.avatar, this.name);
    const {bubbleElement, outerContainer} = messageElements;
    bubbleElement.classList.add(MessageUtils.ERROR_MESSAGE_TEXT_CLASS);
    this.renderText(bubbleElement, text);
    const fontElementStyles = MessageStyleUtils.extractParticularSharedStyles(['fontSize', 'fontFamily'],
      this.messageStyles?.default);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, fontElementStyles);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, this.messageStyles?.error);
    if (!isTop) this.appendOuterContainerElemet(outerContainer);
    if (this.textToSpeech) TextToSpeech.speak(text, this.textToSpeech);
    this._onError?.(text);
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
    if (typeof message === 'object' && message.error) {
      return [message.error];
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

  private addDefaultLoadingMessage() {
    const messageElements = this.createMessageElements('', MessageUtils.AI_ROLE);
    const {bubbleElement} = messageElements;
    messageElements.bubbleElement.classList.add(LoadingStyle.DOTS_CONTAINER_CLASS);
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('loading-message-dots');
    bubbleElement.appendChild(dotsElement);
    LoadingStyle.setDots(bubbleElement, this.messageStyles);
    return messageElements;
  }

  public addLoadingMessage(override = false) {
    const lastMessageEls = this.messageElementRefs[this.messageElementRefs.length - 1];
    if (MessagesBase.isLoadingMessage(lastMessageEls) || (!override && !this._isLoadingMessageAllowed)) return;
    const html = this.messageStyles?.loading?.message?.html;
    const messageElements = html
      ? HTMLMessages.createElements(this, html, MessageUtils.AI_ROLE, false)
      : this.addDefaultLoadingMessage();
    this.appendOuterContainerElemet(messageElements.outerContainer);
    messageElements.bubbleElement.classList.add(LoadingStyle.BUBBLE_CLASS);
    this.applyCustomStyles(messageElements, MessageUtils.AI_ROLE, false, this.messageStyles?.loading?.message?.styles);
    if (!this.focusMode) ElementUtils.scrollToBottom(this.elementRef);
  }

  private populateIntroPanel(childElement?: HTMLElement, introPanelMarkUp?: string, introPanelStyle?: CustomStyle) {
    if (childElement || introPanelMarkUp) {
      this._introPanel = new IntroPanel(childElement, introPanelMarkUp, introPanelStyle);
      if (this._introPanel._elementRef) {
        HTMLUtils.apply(this, this._introPanel._elementRef);
        this.elementRef.appendChild(this._introPanel._elementRef);
      }
    }
  }

  public async addMultipleFiles(filesData: {file: File; type: MessageFileType}[]) {
    return Promise.all<MessageFile>(
      (filesData || []).map((fileData) => {
        return new Promise((resolve) => {
          if (!fileData.type || fileData.type === 'any') {
            const fileName = fileData.file.name || FileMessageUtils.DEFAULT_FILE_NAME;
            resolve({name: fileName, type: 'any', ref: fileData.file});
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(fileData.file);
            reader.onload = () => {
              resolve({src: reader.result as string, type: fileData.type, ref: fileData.file});
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
      if (Messages.isActiveElement(message.bubbleElement.classList)) {
        retainedElements.push(message);
      } else {
        message.outerContainer.remove();
      }
    });
    // this is a form of cleanup as this.messageElementRefs does not contain error messages
    // and can only be deleted by direct search
    Array.from(this.elementRef.children).forEach((messageElement) => {
      const bubbleClasslist = messageElement.children[0]?.children[0];
      if (bubbleClasslist?.classList.contains(MessageUtils.ERROR_MESSAGE_TEXT_CLASS)) {
        messageElement.remove();
      }
    });
    this.messageElementRefs = retainedElements;
    const retainedMessageToElements = this.messageToElements.filter((msgToEls) => {
      // safe because streamed messages can't contain multiple props (text, html)
      return (
        (msgToEls[1].text && Messages.isActiveElement(msgToEls[1].text.bubbleElement.classList)) ||
        (msgToEls[1].html && Messages.isActiveElement(msgToEls[1].html.bubbleElement.classList))
      );
    });
    this.messageToElements.splice(0, this.messageToElements.length, ...retainedMessageToElements);
    if (isReset !== false) {
      if (this._introPanel?._elementRef) this._introPanel.display();
      this.addIntroductoryMessages();
    }
    this._onClearMessages?.();
    delete serviceIO.sessionId;
  }
}
