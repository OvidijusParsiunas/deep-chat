import {MessageContentI, Overwrite} from '../../../types/messagesInternal';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {MessageContent, IntroMessage} from '../../../types/messages';
import {CustomErrors, ServiceIO} from '../../../services/serviceIO';
import {LoadingMessageDotsStyle} from './loadingMessageDotsStyle';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {FireEvents} from '../../../utils/events/fireEvents';
import {ErrorMessageOverrides} from '../../../types/error';
import {ResponseI} from '../../../types/responseInternal';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {Demo, DemoResponse} from '../../../types/demo';
import {MessageStyleUtils} from './messageStyleUtils';
import {MessageStream} from './stream/messageStream';
import {Legacy} from '../../../utils/legacy/legacy';
import {IntroPanel} from '../introPanel/introPanel';
import {FileMessageUtils} from './fileMessageUtils';
import {WebModel} from '../../../webModel/webModel';
import {CustomStyle} from '../../../types/styles';
import {HTMLMessages} from './html/htmlMessages';
import {SetupMessages} from './setupMessages';
import {FileMessages} from './fileMessages';
import {MessageUtils} from './messageUtils';
import {MessagesBase} from './messagesBase';
import {DeepChat} from '../../../deepChat';
import {HTMLUtils} from './html/htmlUtils';

export interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

export class Messages extends MessagesBase {
  private readonly _errorMessageOverrides?: ErrorMessageOverrides;
  private readonly _onClearMessages?: () => void;
  private readonly _onError?: (error: string) => void;
  private readonly _displayLoadingMessage?: boolean;
  private readonly _permittedErrorPrefixes?: CustomErrors;
  private readonly _displayServiceErrorMessages?: boolean;
  private _introMessage?: IntroMessage;
  customDemoResponse?: DemoResponse;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    super(deepChat);
    const {permittedErrorPrefixes, introPanelMarkUp, demo} = serviceIO;
    this._errorMessageOverrides = deepChat.errorMessages?.overrides;
    this._onClearMessages = FireEvents.onClearMessages.bind(this, deepChat);
    this._onError = FireEvents.onError.bind(this, deepChat);
    this._displayLoadingMessage = Messages.getDisplayLoadingMessage(deepChat, serviceIO);
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    if (!this.addSetupMessageIfNeeded(deepChat, serviceIO)) {
      this.populateIntroPanel(panel, introPanelMarkUp, deepChat.introPanelStyle);
    }
    this.addIntroductoryMessage(deepChat, serviceIO);
    if (deepChat.initialMessages) this.populateInitialMessages(deepChat.initialMessages);
    this._displayServiceErrorMessages = deepChat.errorMessages?.displayServiceErrorMessages;
    deepChat.getMessages = () => JSON.parse(JSON.stringify(this.messages));
    deepChat.clearMessages = this.clearMessages.bind(this, serviceIO);
    deepChat.refreshMessages = this.refreshTextMessages.bind(this);
    deepChat.scrollToBottom = ElementUtils.scrollToBottom.bind(this, this.elementRef);
    deepChat._addMessage = (content: MessageContent, isUpdate?: boolean) => {
      this.addNewMessage({...content, sendUpdate: !!isUpdate}, !isUpdate);
    };
    if (serviceIO.isWebModel()) (serviceIO as WebModel).setUpMessages(this);
    if (demo) this.prepareDemo(demo);
    if (deepChat.textToSpeech) {
      TextToSpeech.processConfig(deepChat.textToSpeech, (processedConfig) => {
        this.textToSpeech = processedConfig;
      });
    }
  }

  private static getDisplayLoadingMessage(deepChat: DeepChat, serviceIO: ServiceIO) {
    if (serviceIO.websocket) return false;
    return deepChat.displayLoadingBubble ?? true;
  }

  private prepareDemo(demo: Demo) {
    if (typeof demo === 'object') {
      if (demo.response) this.customDemoResponse = demo.response;
      if (demo.displayErrors) {
        if (demo.displayErrors.default) this.addNewErrorMessage('' as 'service', '');
        if (demo.displayErrors.service) this.addNewErrorMessage('service', '');
        if (demo.displayErrors.speechToText) this.addNewErrorMessage('speechToText', '');
      }
      if (demo.displayLoadingBubble) {
        this.addLoadingMessage();
      }
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
  private addIntroductoryMessage(deepChat?: DeepChat, serviceIO?: ServiceIO) {
    if (deepChat?.shadowRoot) this._introMessage = deepChat.introMessage;
    let introMessage = this._introMessage;
    if (serviceIO?.isWebModel()) introMessage ??= (serviceIO as WebModel).getIntroMessage(introMessage);
    if (introMessage) {
      let elements;
      if (introMessage?.text) {
        elements = this.createAndAppendNewMessageElement(introMessage.text, MessageUtils.AI_ROLE);
      } else if (introMessage?.html) {
        elements = HTMLMessages.add(this, introMessage.html, MessageUtils.AI_ROLE, this.messageElementRefs);
      }
      if (elements) {
        this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false, this.messageStyles?.intro);
        elements.outerContainer.classList.add('deep-chat-intro');
      }
    }
  }

  public removeIntroductoryMessage() {
    const introMessage = this.messageElementRefs[0];
    if (introMessage.outerContainer.classList.contains('deep-chat-intro')) {
      introMessage.outerContainer.remove();
      this.messageElementRefs.shift();
    }
  }

  private populateInitialMessages(initialMessages: MessageContent[]) {
    initialMessages.forEach((message) => {
      Legacy.processInitialMessageFile(message);
      this.addNewMessage(message, true);
    });
    // attempt to wait for the font file to be downloaded as otherwise text dimensions change after scroll
    // the timeout is sometimes not long enough - see the following on how user's can fix it:
    // https://github.com/OvidijusParsiunas/deep-chat/issues/84
    setTimeout(() => ElementUtils.scrollToBottom(this.elementRef), 0);
  }

  // this should not be activated by streamed messages
  public addNewMessage(data: ResponseI, isInitial = false) {
    const message = Messages.createMessageContent(data);
    const overwrite: Overwrite = {status: data.overwrite}; // if did not overwrite, create a new message
    if (!data.ignoreText && message.text !== undefined && data.text !== null) {
      this.addNewTextMessage(message.text, message.role, overwrite);
      if (!isInitial && this.textToSpeech && message.role !== MessageUtils.USER_ROLE) {
        TextToSpeech.speak(message.text, this.textToSpeech);
      }
    }
    if (message.files && Array.isArray(message.files)) {
      FileMessages.addMessages(this, message.files, message.role);
    }
    if (message.html !== undefined && message.html !== null) {
      const elements = HTMLMessages.add(this, message.html, message.role, this.messageElementRefs, overwrite);
      if (HTMLDeepChatElements.isElementTemporary(elements)) delete message.html;
    }
    if (this.isValidMessageContent(message)) {
      this.updateStateOnMessage(message, data.overwrite, data.sendUpdate, isInitial);
    }
  }

  private isValidMessageContent(messageContent: MessageContentI) {
    return messageContent.text || messageContent.html || (messageContent.files && messageContent.files.length > 0);
  }

  private updateStateOnMessage(messageContent: MessageContentI, overwritten?: boolean, update = true, initial = false) {
    if (!overwritten) this.messages.push(messageContent);
    if (update) this.sendClientUpdate(messageContent, initial);
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
  public addNewErrorMessage(type: keyof Omit<ErrorMessageOverrides, 'default'>, message?: string) {
    this.removeMessageOnError();
    const messageElements = Messages.createBaseElements();
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add('error-message-text');
    const text = this.getPermittedMessage(message) || this._errorMessageOverrides?.[type]
      || this._errorMessageOverrides?.default || 'Error, please try again.';
    this.renderText(bubbleElement, text);
    const fontElementStyles = MessageStyleUtils.extractParticularSharedStyles(['fontSize', 'fontFamily'],
      this.messageStyles?.default);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, fontElementStyles);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, this.messageStyles?.error);
    this.elementRef.appendChild(outerContainer);
    ElementUtils.scrollToBottom(this.elementRef);
    if (this.textToSpeech) TextToSpeech.speak(text, this.textToSpeech);
    this._onError?.(text);
  }

  private static checkPermittedErrorPrefixes(errorPrefixes: string[], message: string): string | undefined {
    for (let i = 0; i < errorPrefixes.length; i += 1) {
      if (message.startsWith(errorPrefixes[i])) return message;
    }
    return undefined;
  }

  private getPermittedMessage(message?: string) {
    if (message) {
      if (this._displayServiceErrorMessages) return message;
      if (typeof message === 'string' && this._permittedErrorPrefixes) {
        const result = Messages.checkPermittedErrorPrefixes(this._permittedErrorPrefixes, message);
        if (result) return result;
      } else if (Array.isArray(message) && this._permittedErrorPrefixes) {
        for (let i = 0; i < message.length; i += 1) {
          const result = Messages.checkPermittedErrorPrefixes(this._permittedErrorPrefixes, message[i]);
          if (result) return result;
        }
      }
    }
    return undefined;
  }

  public isLastMessageError() {
    return MessageUtils.getLastMessageBubbleElement(this.elementRef)?.classList.contains('error-message-text');
  }

  public removeError() {
    if (this.isLastMessageError()) MessageUtils.getLastMessageElement(this.elementRef).remove();
  }

  public addLoadingMessage() {
    if (!this._displayLoadingMessage) return;
    const messageElements = this.createMessageElements('', MessageUtils.AI_ROLE);
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add('loading-message-text');
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('dots-flashing');
    bubbleElement.appendChild(dotsElement);
    this.applyCustomStyles(messageElements, MessageUtils.AI_ROLE, false, this.messageStyles?.loading);
    LoadingMessageDotsStyle.set(bubbleElement, this.messageStyles);
    this.elementRef.appendChild(outerContainer);
    ElementUtils.scrollToBottom(this.elementRef);
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

  // WORK - update all message classes to use deep-chat prefix
  private clearMessages(serviceIO: ServiceIO, isReset?: boolean) {
    const retainedElements: MessageElements[] = [];
    this.messageElementRefs.forEach((message) => {
      const bubbleClasslist = message.bubbleElement.classList;
      if (bubbleClasslist.contains('loading-message-text') || bubbleClasslist.contains(MessageStream.MESSAGE_CLASS)) {
        retainedElements.push(message);
      } else {
        message.outerContainer.remove();
      }
    });
    // this is a form of cleanup as this.messageElementRefs does not contain error messages
    // and can only be deleted by direct search
    Array.from(this.elementRef.children).forEach((messageElement) => {
      const bubbleClasslist = messageElement.children[0]?.children[0];
      if (bubbleClasslist?.classList.contains('error-message-text')) {
        messageElement.remove();
      }
    });
    this.messageElementRefs = retainedElements;
    if (isReset !== false) {
      if (this._introPanel?._elementRef) this._introPanel.display();
      this.addIntroductoryMessage();
    }
    this.messages.splice(0, this.messages.length);
    this.textElementsToText.splice(0, this.textElementsToText.length);
    this._onClearMessages?.();
    delete serviceIO.sessionId;
  }
}
