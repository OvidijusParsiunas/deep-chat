import {ProcessedTextToSpeechConfig, TextToSpeech} from './textToSpeech/textToSpeech';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {CustomErrors, ServiceIO} from '../../../services/serviceIO';
import {LoadingMessageDotsStyle} from './loadingMessageDotsStyle';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {Result as MessageData} from '../../../types/result';
import {FireEvents} from '../../../utils/events/fireEvents';
import {Demo, DemoResponse} from '../../../types/demo';
import {MessageStyleUtils} from './messageStyleUtils';
import {IntroPanel} from '../introPanel/introPanel';
import {FileMessageUtils} from './fileMessageUtils';
import {CustomStyle} from '../../../types/styles';
import {Avatars} from '../../../types/avatars';
import {FileMessages} from './fileMessages';
import {DeepChat} from '../../../deepChat';
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
} from '../../../types/messages';

export interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

export class Messages {
  elementRef: HTMLElement;
  readonly messageStyles?: MessageStyles;
  private readonly _messageElementRefs: MessageElements[] = [];
  private readonly _avatars?: Avatars;
  private readonly _names?: Names;
  private readonly _errorMessageOverrides?: ErrorMessageOverrides;
  private readonly _onNewMessage?: (message: MessageContent, isInitial: boolean) => void;
  private readonly _displayLoadingMessage?: boolean;
  private readonly _permittedErrorPrefixes?: CustomErrors;
  private readonly displayServiceErrorMessages?: boolean;
  private _remarkable: Remarkable;
  private _textToSpeech?: ProcessedTextToSpeechConfig;
  private _introPanel?: IntroPanel;
  private _streamedText = '';
  messages: MessageContent[] = [];
  customDemoResponse?: DemoResponse;

  constructor(deepChat: DeepChat, serviceIO: ServiceIO, panel?: HTMLElement) {
    const {permittedErrorPrefixes, introPanelMarkUp, demo} = serviceIO;
    this._remarkable = RemarkableConfig.createNew();
    this.elementRef = Messages.createContainerElement();
    this.messageStyles = deepChat.messageStyles;
    this._avatars = deepChat.avatars;
    this._names = deepChat.names;
    this._errorMessageOverrides = deepChat.errorMessages?.overrides;
    this._onNewMessage = FireEvents.onNewMessage.bind(this, deepChat);
    this._displayLoadingMessage = Messages.getDisplayLoadingMessage(deepChat, serviceIO);
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    this.populateIntroPanel(panel, introPanelMarkUp, deepChat.introPanelStyle);
    if (deepChat.introMessage) this.addIntroductoryMessage(deepChat.introMessage);
    if (deepChat.initialMessages) this.populateInitialMessages(deepChat.initialMessages);
    this.displayServiceErrorMessages = deepChat.errorMessages?.displayServiceErrorMessages;
    deepChat.getMessages = () => JSON.parse(JSON.stringify(this.messages));
    deepChat.refreshMessages = this.refreshTextMessages.bind(this);
    if (demo) this.prepareDemo(demo);
    if (deepChat.textToSpeech) {
      TextToSpeech.processConfig(deepChat.textToSpeech, (processedConfig) => {
        this._textToSpeech = processedConfig;
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

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
    return container;
  }

  private addIntroductoryMessage(introMessage: string) {
    const elements = this.createAndAppendNewMessageElement(introMessage, true);
    this.applyCustomStyles(elements, true, false, this.messageStyles?.intro);
  }

  private populateInitialMessages(initialMessages: MessageContent[]) {
    initialMessages.forEach((message) => {
      if (message.text) {
        this.addNewMessage({text: message.text}, message.role === 'ai', true, true);
      } else if (message.file) {
        this.addNewMessage({files: [message.file]}, message.role === 'ai', true, true);
      }
    });
    setTimeout(() => (this.elementRef.scrollTop = this.elementRef.scrollHeight));
  }

  // prettier-ignore
  public applyCustomStyles(elements: MessageElements, isAI: boolean, media: boolean,
      otherStyles?: MessageRoleStyles | MessageElementsStyles) {
    if (this.messageStyles) {
      MessageStyleUtils.applyCustomStyles(this.messageStyles, elements, isAI, media, otherStyles);
    }
  }

  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, isAI: boolean) {
    bubbleElement.classList.add('message-bubble', isAI ? 'ai-message-text' : 'user-message-text');
    bubbleElement.innerHTML = this._remarkable.render(text);
    // there is a bug in remarkable where text with only numbers and full stop after them causes the creation
    // of a list which has no innert text and is instead prepended as a prefix in the start attribute (12.)
    if (bubbleElement.innerText.trim().length === 0) bubbleElement.innerText = text;
    if (this._avatars) AvatarEl.add(bubbleElement, isAI, this._avatars);
    if (this._names) Name.add(bubbleElement, isAI, this._names);
    return {bubbleElement};
  }

  public static createMessageContent(isAI: boolean, text?: string, file?: MessageFile): MessageContent {
    if (file) {
      return {role: isAI ? 'ai' : 'user', file};
    }
    return {role: isAI ? 'ai' : 'user', text: text || ''};
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

  private createMessageElements(text: string, isAI: boolean) {
    const messageElements = Messages.createBaseElements();
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, isAI);
    this._messageElementRefs.push(messageElements);
    return messageElements;
  }

  public createNewMessageElement(text: string, isAI: boolean) {
    this._introPanel?.hide();
    const lastMessageElements = this._messageElementRefs[this._messageElementRefs.length - 1];
    if (lastMessageElements?.bubbleElement.classList.contains('loading-message-text')) {
      lastMessageElements.outerContainer.remove();
      this._messageElementRefs.pop();
    }
    return this.createMessageElements(text, isAI);
  }

  private createAndAppendNewMessageElement(text: string, isAI: boolean) {
    const messageElements = this.createNewMessageElement(text, isAI);
    this.elementRef.appendChild(messageElements.outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    return messageElements;
  }

  private static editEmptyMessageElement(bubbleElement: HTMLElement) {
    bubbleElement.textContent = '.';
    bubbleElement.style.color = '#00000000';
  }

  private addNewTextMessage(text: string, isAI: boolean, update: boolean, isInitial = false) {
    const messageElements = this.createAndAppendNewMessageElement(text, isAI);
    this.applyCustomStyles(messageElements, isAI, false);
    const messageContent = Messages.createMessageContent(isAI, text);
    if (text.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    this.messages.push(messageContent);
    if (update) this.sendClientUpdate(messageContent, isInitial);
    return messageElements;
  }

  public addNewMessage(data: MessageData, isAI: boolean, update: boolean, isInitial = false) {
    if (data.text !== undefined && data.text !== null) {
      this.addNewTextMessage(data.text, isAI, update, isInitial);
      if (!isInitial && this._textToSpeech && isAI) TextToSpeech.speak(data.text, this._textToSpeech);
    } else if (data.files)
      data.files.forEach((fileData) => {
        // extra checks are used for 'any'
        if (fileData.type === 'audio' || fileData.src?.startsWith('data:audio')) {
          FileMessages.addNewAudioMessage(this, fileData, isAI, isInitial);
        } else if (fileData.type === 'image' || fileData.type === 'gif' || fileData.src?.startsWith('data:image')) {
          FileMessages.addNewImageMessage(this, fileData, isAI, isInitial);
        } else {
          FileMessages.addNewAnyFileMessage(this, fileData, isAI, isInitial);
        }
      });
  }

  public sendClientUpdate(message: MessageContent, isInitial = false) {
    this._onNewMessage?.(message, isInitial);
  }

  // prettier-ignore
  private removeMessageOnError() {
    const lastTextElement = this._messageElementRefs[this._messageElementRefs.length - 1]?.bubbleElement;
    if ((lastTextElement?.classList.contains('streamed-message') && lastTextElement.textContent === '') ||
        lastTextElement?.classList.contains('loading-message-text')) {
      lastTextElement.remove();
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
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
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
      if (this.displayServiceErrorMessages) return message;
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
    return this.elementRef.children[this.elementRef.children.length - 1]?.children?.[0]?.children?.[0]?.classList.contains(
      'error-message-text'
    );
  }

  public addLoadingMessage() {
    if (!this._displayLoadingMessage) return;
    const messageElements = this.createMessageElements('', true);
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add('loading-message-text');
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('dots-flashing');
    bubbleElement.appendChild(dotsElement);
    this.applyCustomStyles(messageElements, true, false, this.messageStyles?.loading);
    LoadingMessageDotsStyle.set(bubbleElement, this.messageStyles);
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
  }

  public addNewStreamedMessage() {
    const {bubbleElement} = this.addNewTextMessage('', true, false);
    bubbleElement.classList.add('streamed-message');
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    return bubbleElement;
  }

  public updateStreamedMessage(text: string, bubbleElement: HTMLElement) {
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    if (text.trim().length !== 0) {
      const defaultColor = this.messageStyles?.default;
      bubbleElement.style.color = defaultColor?.ai?.bubble?.color || defaultColor?.shared?.bubble?.color || '';
    }
    this._streamedText += text;
    bubbleElement.innerHTML = this._remarkable.render(this._streamedText);
    if (isScrollbarAtBottomOfElement) this.elementRef.scrollTop = this.elementRef.scrollHeight;
  }

  public finaliseStreamedMessage() {
    this.messages[this.messages.length - 1].text = this._streamedText;
    this.sendClientUpdate(Messages.createMessageContent(true, this._streamedText), false);
    if (this._textToSpeech) TextToSpeech.speak(this._streamedText, this._textToSpeech);
    this._streamedText = '';
  }

  private populateIntroPanel(childElement?: HTMLElement, introPanelMarkUp?: string, introPanelStyle?: CustomStyle) {
    if (childElement || introPanelMarkUp) {
      this._introPanel = new IntroPanel(childElement, introPanelMarkUp, introPanelStyle);
      if (this._introPanel._elementRef) this.elementRef.appendChild(this._introPanel._elementRef);
    }
  }

  async addMultipleFiles(filesData: {file: File; type: MessageFileType}[]) {
    return Promise.all(
      (filesData || []).map((fileData) => {
        return new Promise((resolve) => {
          if (!fileData.type || fileData.type === 'any') {
            const fileName = fileData.file.name || FileMessageUtils.DEFAULT_FILE_NAME;
            this.addNewMessage({files: [{name: fileName, type: 'any'}]}, false, true);
            resolve(true);
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(fileData.file);
            reader.onload = () => {
              this.addNewMessage({files: [{src: reader.result as string, type: fileData.type}]}, false, true);
              resolve(true);
            };
          }
        });
      })
    );
  }

  // this is mostly used for enabling highlight.js to highlight code if it is downloads later
  private refreshTextMessages() {
    this._remarkable = RemarkableConfig.createNew();
    this.messages.forEach((message, index) => {
      if (message.text) this._messageElementRefs[index].bubbleElement.innerHTML = this._remarkable.render(message.text);
    });
  }
}
