import {PermittedErrorMessage} from '../../../types/permittedErrorMessage';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {Result as MessageData} from '../../../types/result';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {CustomErrors} from '../../../services/serviceIO';
import {MessageStyleUtils} from './messageStyleUtils';
import {IntroPanel} from '../introPanel/introPanel';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Avatars} from '../../../types/avatar';
import {FileMessages} from './fileMessages';
import {Names} from '../../../types/names';
import {Remarkable} from 'remarkable';
import {Avatar} from './avatar';
import {Name} from './name';
import {
  ErrorMessageOverrides,
  MessageElementsStyles,
  MessageSideStyles,
  MessageContent,
  MessageStyles,
  OnNewMessage,
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
  private readonly _onNewMessage?: OnNewMessage;
  private readonly _dispatchEvent: (event: Event) => void;
  private readonly _speechOutput?: boolean;
  private readonly _displayLoadingMessage?: boolean;
  private readonly _remarkable: Remarkable;
  private readonly _permittedErrorPrefixes?: CustomErrors;
  private _introPanel?: IntroPanel;
  private _streamedText = '';
  messages: MessageContent[] = [];

  constructor(aiAssistant: AiAssistant, introPanelMarkUp?: string, permittedErrorPrefixes?: CustomErrors) {
    this._remarkable = RemarkableConfig.createNew();
    this.elementRef = Messages.createContainerElement();
    this.messageStyles = aiAssistant.messageStyles;
    this._avatars = aiAssistant.avatars;
    this._names = aiAssistant.names;
    this._errorMessageOverrides = aiAssistant.errorMessageOverrides;
    this._speechOutput = aiAssistant.speechOutput;
    this._dispatchEvent = aiAssistant.dispatchEvent.bind(aiAssistant);
    this._onNewMessage = aiAssistant.onNewMessage;
    this._displayLoadingMessage = aiAssistant.displayLoadingMessage ?? true;
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    this.populateIntroPanel(aiAssistant._isSlotPopulated, introPanelMarkUp, aiAssistant.introPanelStyle);
    if (aiAssistant.introMessage) this.addIntroductoryMessage(aiAssistant.introMessage);
    if (aiAssistant.initialMessages) this.populateInitialMessages(aiAssistant.initialMessages);
    aiAssistant.getMessages = () => this.messages;
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
  }

  // prettier-ignore
  public applyCustomStyles(elements: MessageElements, isAI: boolean, media: boolean,
      otherStyles?: MessageSideStyles | MessageElementsStyles) {
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
    if (this._avatars) Avatar.add(bubbleElement, isAI, this._avatars);
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
    if (this._speechOutput && isAI) TextToSpeech.speak(text);
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
    if (data.text !== undefined) {
      this.addNewTextMessage(data.text, isAI, update, isInitial);
    } else if (data.files)
      data.files.forEach((fileData) => {
        // extra checks are used for 'file'
        if (fileData.type === 'audio' || fileData.base64?.startsWith('data:audio')) {
          FileMessages.addNewAudioMessage(this, fileData, isAI, isInitial);
        } else if (fileData.type === 'image' || fileData.base64?.startsWith('data:image')) {
          FileMessages.addNewImageMessage(this, fileData, isAI, isInitial);
        } else {
          FileMessages.addNewAnyFileMessage(this, fileData, isAI, isInitial);
        }
      });
  }

  public sendClientUpdate(message: MessageContent, isInitial = false) {
    this._onNewMessage?.(message, isInitial);
    this._dispatchEvent(new CustomEvent('new-message', {detail: {message, isInitial}}));
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
  public addNewErrorMessage(type: keyof Omit<ErrorMessageOverrides, 'default'>, message?: string | PermittedErrorMessage) {
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
    if (this._speechOutput && window.SpeechSynthesisUtterance) TextToSpeech.speak(text);
    this._streamedText = '';
  }

  private static checkPermittedErrorPrefixes(errorPrefixes: string[], message: string): string | undefined {
    for (let i = 0; i < errorPrefixes.length; i += 1) {
      if (message.startsWith(errorPrefixes[i])) return message;
    }
    return undefined;
  }
  private getPermittedMessage(message?: string | PermittedErrorMessage) {
    if (message) {
      if (typeof message === 'string' && this._permittedErrorPrefixes) {
        const result = Messages.checkPermittedErrorPrefixes(Array.from(this._permittedErrorPrefixes), message);
        if (result) return result;
      } else if (Array.isArray(message) && this._permittedErrorPrefixes) {
        const errorPrefixes = Array.from(this._permittedErrorPrefixes);
        for (let i = 0; i < message.length; i += 1) {
          const result = Messages.checkPermittedErrorPrefixes(errorPrefixes, message[i]);
          if (result) return result;
        }
      } else if (typeof message === 'object' && message.permittedErrorMessage) {
        return message.permittedErrorMessage;
      }
    }
    return undefined;
  }

  public addLoadingMessage() {
    if (!this._displayLoadingMessage) return;
    const messageElements = this.createMessageElements('', true);
    const {outerContainer, bubbleElement} = messageElements;
    bubbleElement.classList.add('loading-message-text');
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('dots-flashing');
    bubbleElement.appendChild(dotsElement);
    this.applyCustomStyles(messageElements, false, false, this.messageStyles?.loading);
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
  }

  public addNewStreamedMessage() {
    const {bubbleElement} = this.addNewTextMessage('', true, false);
    bubbleElement.classList.add('streamed-message');
    return bubbleElement;
  }

  public updateStreamedMessage(text: string, bubbleElement: HTMLElement) {
    const isScrollbarAtBottomOfElement = ElementUtils.isScrollbarAtBottomOfElement(this.elementRef);
    this._streamedText += text;
    bubbleElement.innerHTML = this._remarkable.render(this._streamedText);
    if (isScrollbarAtBottomOfElement) this.elementRef.scrollTop = this.elementRef.scrollHeight;
  }

  public finaliseStreamedMessage(text: string) {
    this.sendClientUpdate(Messages.createMessageContent(true, text), false);
    if (this._speechOutput && window.SpeechSynthesisUtterance) TextToSpeech.speak(text);
    this._streamedText = '';
  }

  private populateIntroPanel(isSlotPopulated: boolean, introPanelMarkUp?: string, introPanelStyle?: CustomStyle) {
    if (isSlotPopulated || introPanelMarkUp) {
      this._introPanel = new IntroPanel(isSlotPopulated, introPanelMarkUp, introPanelStyle);
      if (this._introPanel._elementRef) this.elementRef.appendChild(this._introPanel._elementRef);
    }
  }

  async addMultipleFiles(filesData: {file: File; type: MessageFileType}[]) {
    return Promise.all(
      (filesData || []).map((fileData) => {
        return new Promise((resolve) => {
          if (fileData.type === 'file') {
            this.addNewMessage({files: [{name: fileData.file.name, type: fileData.type}]}, false, true);
            resolve(true);
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(fileData.file);
            reader.onload = () => {
              this.addNewMessage({files: [{base64: reader.result as string, type: fileData.type}]}, false, true);
              resolve(true);
            };
          }
        });
      })
    );
  }
}
