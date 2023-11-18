import {ProcessedTextToSpeechConfig, TextToSpeech} from './textToSpeech/textToSpeech';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {CustomErrors, ServiceIO} from '../../../services/serviceIO';
import {LoadingMessageDotsStyle} from './loadingMessageDotsStyle';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {HTMLDeepChatElements} from './html/htmlDeepChatElements';
import {MessageContentI} from '../../../types/messagesInternal';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {FireEvents} from '../../../utils/events/fireEvents';
import {ResponseI} from '../../../types/responseInternal';
import {HTMLClassUtilities} from '../../../types/html';
import {Demo, DemoResponse} from '../../../types/demo';
import {MessageStyleUtils} from './messageStyleUtils';
import {Legacy} from '../../../utils/legacy/legacy';
import {IntroPanel} from '../introPanel/introPanel';
import {FileMessageUtils} from './fileMessageUtils';
import {CustomStyle} from '../../../types/styles';
import {HTMLMessages} from './html/htmlMessages';
import {Response} from '../../../types/response';
import {Avatars} from '../../../types/avatars';
import {SetupMessages} from './setupMessages';
import {FileMessages} from './fileMessages';
import {MessageUtils} from './messageUtils';
import {DeepChat} from '../../../deepChat';
import {HTMLUtils} from './html/htmlUtils';
import {Names} from '../../../types/names';
import {Remarkable} from 'remarkable';
import {AvatarEl} from './avatar';
import {Name} from './name';
import {
  ErrorMessageOverrides,
  MessageElementsStyles,
  MessageRoleStyles,
  MessageContent,
  MessageStyles,
  IntroMessage,
} from '../../../types/messages';

export interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

export class Messages {
  elementRef: HTMLElement;
  readonly messageStyles?: MessageStyles;
  private _messageElementRefs: MessageElements[] = [];
  private readonly _avatars?: Avatars;
  private readonly _names?: Names;
  private readonly _errorMessageOverrides?: ErrorMessageOverrides;
  private readonly _onNewMessage?: (message: MessageContentI, isInitial: boolean) => void;
  private readonly _onClearMessages?: () => void;
  private readonly _displayLoadingMessage?: boolean;
  private readonly _permittedErrorPrefixes?: CustomErrors;
  private readonly _displayServiceErrorMessages?: boolean;
  private readonly _textElementsToText: [MessageElements, string][] = [];
  private _remarkable: Remarkable;
  private _textToSpeech?: ProcessedTextToSpeechConfig;
  private _introPanel?: IntroPanel;
  private _introMessage?: IntroMessage;
  private _streamedText = '';
  readonly htmlClassUtilities: HTMLClassUtilities = {};
  messages: MessageContentI[] = [];
  customDemoResponse?: DemoResponse;
  submitUserMessage?: (text: string) => void;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    const {permittedErrorPrefixes, introPanelMarkUp, demo} = serviceIO;
    this._remarkable = RemarkableConfig.createNew();
    this.elementRef = Messages.createContainerElement();
    this.messageStyles = deepChat.messageStyles;
    this._avatars = deepChat.avatars;
    this._names = deepChat.names;
    this._errorMessageOverrides = deepChat.errorMessages?.overrides;
    if (deepChat.htmlClassUtilities) this.htmlClassUtilities = deepChat.htmlClassUtilities;
    this._onNewMessage = FireEvents.onNewMessage.bind(this, deepChat);
    this._onClearMessages = FireEvents.onClearMessages.bind(this, deepChat);
    this._displayLoadingMessage = Messages.getDisplayLoadingMessage(deepChat, serviceIO);
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    this.addSetupMessageIfNeeded(deepChat, serviceIO);
    this.populateIntroPanel(panel, introPanelMarkUp, deepChat.introPanelStyle);
    if (deepChat.introMessage) this.addIntroductoryMessage(deepChat.introMessage);
    if (deepChat.initialMessages) this.populateInitialMessages(deepChat.initialMessages);
    this._displayServiceErrorMessages = deepChat.errorMessages?.displayServiceErrorMessages;
    deepChat.getMessages = () => JSON.parse(JSON.stringify(this.messages));
    deepChat.clearMessages = this.clearMessages.bind(this, serviceIO);
    deepChat.refreshMessages = this.refreshTextMessages.bind(this);
    deepChat.scrollToBottom = this.scrollToBottom.bind(this);
    serviceIO.addMessage = this.addNewMessage.bind(this);
    if (demo) this.prepareDemo(demo);
    if (deepChat.textToSpeech) {
      TextToSpeech.processConfig(deepChat.textToSpeech, (processedConfig) => {
        this._textToSpeech = processedConfig;
      });
    }
    setTimeout(() => {
      this.submitUserMessage = deepChat.submitUserMessage; // wait for it to be available
    });
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

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
    return container;
  }

  private addSetupMessageIfNeeded(deepChat: DeepChat, serviceIO: ServiceIO) {
    const text = SetupMessages.getText(deepChat, serviceIO);
    if (text) {
      const elements = this.createAndAppendNewMessageElement(text, MessageUtils.AI_ROLE);
      this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false);
    }
  }

  private addIntroductoryMessage(introMessage?: IntroMessage) {
    if (introMessage) this._introMessage = introMessage;
    if (this._introMessage?.text) {
      const elements = this.createAndAppendNewMessageElement(this._introMessage.text, MessageUtils.AI_ROLE);
      this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false, this.messageStyles?.intro);
    } else if (this._introMessage?.html) {
      const elements = HTMLMessages.add(this, this._introMessage.html, MessageUtils.AI_ROLE, this._messageElementRefs);
      this.applyCustomStyles(elements, MessageUtils.AI_ROLE, false, this.messageStyles?.intro);
    }
  }

  private populateInitialMessages(initialMessages: MessageContent[]) {
    initialMessages.forEach((message) => {
      Legacy.processInitialMessageFile(message);
      this.addNewMessage(message, true);
    });
    // still not enough for when font file is downloaded later as text size changes, hence need to scroll programmatically
    setTimeout(() => this.scrollToBottom());
  }

  // prettier-ignore
  public applyCustomStyles(elements: MessageElements | undefined, role: string, media: boolean,
      otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (elements && this.messageStyles) {
      MessageStyleUtils.applyCustomStyles(this.messageStyles, elements, role, media, otherStyles);
    }
  }

  // prettier-ignore
  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, role: string) {
    bubbleElement.classList.add('message-bubble',
      role === MessageUtils.USER_ROLE ? 'user-message-text' : 'ai-message-text');
    bubbleElement.innerHTML = this._remarkable.render(text);
    // there is a bug in remarkable where text with only numbers and full stop after them causes the creation
    // of a list which has no innert text and is instead prepended as a prefix in the start attribute (12.)
    if (bubbleElement.innerText.trim().length === 0) bubbleElement.innerText = text;
    if (this._avatars) AvatarEl.add(bubbleElement, role, this._avatars);
    if (this._names) Name.add(bubbleElement, role, this._names);
    return {bubbleElement};
  }

  private static processMessageContent(content: Response): MessageContentI {
    if (!content.text && !content.files && !content.html) content.text = '';
    content.role ??= MessageUtils.AI_ROLE;
    return content as MessageContentI;
  }

  private static createBaseElements(): MessageElements {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    outerContainer.classList.add('outer-message-container');
    const bubbleElement = document.createElement('div');
    bubbleElement.classList.add('message-bubble');
    innerContainer.appendChild(bubbleElement);
    return {outerContainer, innerContainer, bubbleElement};
  }

  private createMessageElements(text: string, role: string) {
    const messageElements = Messages.createBaseElements();
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, role);
    this._messageElementRefs.push(messageElements);
    return messageElements;
  }

  private static isTemporaryElement(elements: MessageElements) {
    return (
      elements?.bubbleElement.classList.contains('loading-message-text') ||
      HTMLDeepChatElements.isElementTemporary(elements)
    );
  }

  public createNewMessageElement(text: string, role: string) {
    this._introPanel?.hide();
    const lastMessageElements = this._messageElementRefs[this._messageElementRefs.length - 1];
    if (Messages.isTemporaryElement(lastMessageElements)) {
      lastMessageElements.outerContainer.remove();
      this._messageElementRefs.pop();
    }
    return this.createMessageElements(text, role);
  }

  private createAndAppendNewMessageElement(text: string, role: string) {
    const messageElements = this.createNewMessageElement(text, role);
    this.elementRef.appendChild(messageElements.outerContainer);
    setTimeout(() => this.scrollToBottom()); // timeout neeed when bubble font is large
    return messageElements;
  }

  // makes sure the bubble has dimensions when there is no text
  public static editEmptyMessageElement(bubbleElement: HTMLElement) {
    bubbleElement.textContent = '.';
    bubbleElement.style.color = '#00000000';
  }

  private addNewTextMessage(text: string, role: string) {
    const messageElements = this.createAndAppendNewMessageElement(text, role);
    this.applyCustomStyles(messageElements, role, false);
    if (text.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    this._textElementsToText.push([messageElements, text]);
    return messageElements;
  }

  // this should not be activated by streamed messages
  public addNewMessage(data: ResponseI, isInitial = false) {
    let isNewMessage = true;
    const message = Messages.processMessageContent(data);
    if (message.text !== undefined && data.text !== null) {
      this.addNewTextMessage(message.text, message.role);
      if (!isInitial && this._textToSpeech && message.role !== MessageUtils.USER_ROLE) {
        TextToSpeech.speak(message.text, this._textToSpeech);
      }
    }
    if (message.files && Array.isArray(message.files)) {
      FileMessages.addMessages(this, message.files, message.role);
    }
    if (message.html !== undefined && message.html !== null) {
      const elements = HTMLMessages.add(this, message.html, message.role, this._messageElementRefs);
      if (HTMLDeepChatElements.isElementTemporary(elements)) delete message.html;
      isNewMessage = !!elements;
    }
    this.updateStateOnMessage(message, isNewMessage, data.sendUpdate, isInitial);
  }

  private updateStateOnMessage(messageContent: MessageContentI, isNewMessage: boolean, update = true, initial = false) {
    if (isNewMessage) this.messages.push(messageContent);
    if (update) this.sendClientUpdate(messageContent, initial);
  }

  private sendClientUpdate(message: MessageContentI, isInitial = false) {
    this._onNewMessage?.(JSON.parse(JSON.stringify(message)), isInitial);
  }

  // prettier-ignore
  private removeMessageOnError() {
    const lastMessage = this._messageElementRefs[this._messageElementRefs.length - 1];
    const lastMessageBubble = lastMessage?.bubbleElement;
    if ((lastMessageBubble?.classList.contains('streamed-message') && lastMessageBubble.textContent === '') ||
        Messages.isTemporaryElement(lastMessage)) {
      lastMessage.outerContainer.remove();
      this._messageElementRefs.pop();
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
    bubbleElement.innerHTML = text;
    const fontElementStyles = MessageStyleUtils.extractParticularSharedStyles(['fontSize', 'fontFamily'],
      this.messageStyles?.default);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, fontElementStyles);
    MessageStyleUtils.applyCustomStylesToElements(messageElements, false, this.messageStyles?.error);
    this.elementRef.appendChild(outerContainer);
    this.scrollToBottom();
    if (this._textToSpeech) TextToSpeech.speak(text, this._textToSpeech);
    this._streamedText = '';
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

  private getLastMessageElement() {
    return this.elementRef.children[this.elementRef.children.length - 1];
  }

  private getLastMessageBubbleElement() {
    return Array.from(this.getLastMessageElement()?.children?.[0]?.children || []).find((element) => {
      return element.classList.contains('message-bubble');
    });
  }

  public isLastMessageError() {
    return this.getLastMessageBubbleElement()?.classList.contains('error-message-text');
  }

  public removeError() {
    if (this.isLastMessageError()) this.getLastMessageElement().remove();
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
    this.scrollToBottom();
  }

  public addNewStreamedMessage(role?: string) {
    const {bubbleElement} = this.addNewTextMessage('', role || MessageUtils.AI_ROLE);
    const messageContent = Messages.processMessageContent({text: ''});
    this.messages.push(messageContent);
    bubbleElement.classList.add('streamed-message');
    this.scrollToBottom(); // need to scroll down completely
  }

  public updateStreamedMessage(text: string, isIncrement = true) {
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    const {bubbleElement} = this._messageElementRefs[this._messageElementRefs.length - 1];
    if (text.trim().length !== 0) {
      const defaultColor = this.messageStyles?.default;
      bubbleElement.style.color = defaultColor?.ai?.bubble?.color || defaultColor?.shared?.bubble?.color || '';
    }
    this._streamedText = isIncrement ? this._streamedText + text : text;
    this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedText;
    bubbleElement.innerHTML = this._remarkable.render(this._streamedText);
    if (isScrollbarAtBottomOfElement) this.scrollToBottom();
  }

  public isStreamingText() {
    return !!this._streamedText;
  }

  public finaliseStreamedMessage() {
    if (!this.getLastMessageBubbleElement()?.classList.contains('streamed-message')) return;
    this._textElementsToText[this._textElementsToText.length - 1][1] = this._streamedText;
    this.messages[this.messages.length - 1].text = this._streamedText;
    this.sendClientUpdate(Messages.processMessageContent({text: this._streamedText}), false);
    if (this._textToSpeech) TextToSpeech.speak(this._streamedText, this._textToSpeech);
    this._streamedText = '';
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
            resolve({name: fileName, type: 'any'});
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(fileData.file);
            reader.onload = () => {
              resolve({src: reader.result as string, type: fileData.type});
            };
          }
        });
      })
    );
  }

  // WORK - update all message classes to use deep-chat prefix
  private clearMessages(serviceIO: ServiceIO, isReset?: boolean) {
    const retainedElements: MessageElements[] = [];
    this._messageElementRefs.forEach((message) => {
      const bubbleClasslist = message.bubbleElement.classList;
      if (bubbleClasslist.contains('loading-message-text') || bubbleClasslist.contains('streamed-message')) {
        retainedElements.push(message);
      } else {
        message.outerContainer.remove();
      }
    });
    // this is a form of cleanup as this._messageElementRefs does not contain error messages
    // and can only be deleted by direct search
    Array.from(this.elementRef.children).forEach((messageElement) => {
      const bubbleClasslist = messageElement.children[0]?.children[0];
      if (bubbleClasslist?.classList.contains('error-message-text')) {
        messageElement.remove();
      }
    });
    this._messageElementRefs = retainedElements;
    if (isReset !== false) {
      if (this._introPanel?._elementRef) this._introPanel.display();
      this.addIntroductoryMessage();
    }
    this.messages.splice(0, this.messages.length);
    this._textElementsToText.splice(0, this._textElementsToText.length);
    this._onClearMessages?.();
    delete serviceIO.sessionId;
  }

  private scrollToBottom() {
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
  }

  // this is mostly used for enabling highlight.js to highlight code if it downloads later
  private refreshTextMessages() {
    this._remarkable = RemarkableConfig.createNew();
    this._textElementsToText.forEach((elementToText) => {
      elementToText[0].bubbleElement.innerHTML = this._remarkable.render(elementToText[1]);
    });
  }
}
