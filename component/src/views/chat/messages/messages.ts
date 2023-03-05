import {TextToSpeech} from './textToSpeech/textToSpeech';
import {AiAssistant} from '../../../aiAssistant';
import {Avatars} from '../../../types/avatar';
import {Names} from '../../../types/names';
import {Avatar} from './avatar';
import {Name} from './name';
import {
  CustomMessageStyles,
  CustomMessageStyle,
  MessageContent,
  OnNewMessage,
  ErrorMessage,
} from '../../../types/messages';

export type AddNewMessage = Messages['addNewMessage'];

export class Messages {
  elementRef: HTMLElement;
  private readonly _textElementRefs: HTMLElement[] = [];
  private readonly _messageStyles?: CustomMessageStyles;
  private readonly _avatars?: Avatars;
  private readonly _names?: Names;
  private readonly _customErrorMessage?: ErrorMessage;
  private readonly _onNewMessage?: OnNewMessage;
  private readonly _dispatchEvent: (event: Event) => void;
  private readonly _speechOutput?: boolean;
  messages: MessageContent[] = [];

  constructor(aiAssistant: AiAssistant) {
    this.elementRef = Messages.createContainerElement();
    this._messageStyles = aiAssistant.messageStyles;
    this._avatars = aiAssistant.avatars;
    this._names = aiAssistant.names;
    this._customErrorMessage = aiAssistant.errorMessage;
    this._speechOutput = aiAssistant.speechOutput;
    this._dispatchEvent = aiAssistant.dispatchEvent.bind(aiAssistant);
    this._onNewMessage = aiAssistant.onNewMessage;
    if (aiAssistant.startMessages) this.populateInitialMessages(aiAssistant.startMessages);
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
    return container;
  }

  private populateInitialMessages(startMessages: MessageContent[]) {
    startMessages.forEach(({role, text}) => {
      this.addNewMessage(text, role === 'ai');
    });
  }

  // prettier-ignore
  private static applyCustomStylesToElements(outerC: HTMLElement, innerC: HTMLElement,
      text: HTMLElement, style: CustomMessageStyle) {
    Object.assign(outerC.style, style.outerContainer);
    Object.assign(innerC.style, style.innerContainer);
    Object.assign(text.style, style.text);
  }

  // prettier-ignore
  private static applyCustomStyles(outerC: HTMLElement, innerC: HTMLElement,
      text: HTMLElement, styles: CustomMessageStyles, isAI: boolean) {
    if (styles.default) Messages.applyCustomStylesToElements(outerC, innerC, text, styles.default);
    if (isAI) {
      if (styles.ai) Messages.applyCustomStylesToElements(outerC, innerC, text, styles.ai);
    } else if (styles.user) {
      Messages.applyCustomStylesToElements(outerC, innerC, text, styles.user);
    }
  }

  private addInnerContainerElements(textElement: HTMLElement, text: string, isAI: boolean) {
    textElement.classList.add('message-text', isAI ? 'ai-message-text' : 'user-message-text');
    textElement.innerHTML = text;
    if (this._avatars) Avatar.add(textElement, isAI, this._avatars);
    if (this._names) Name.add(textElement, isAI, this._names);
    return {textElement};
  }

  private static createMessageContent(text: string, isAI: boolean) {
    return {role: isAI ? 'ai' : 'user', text} as const;
  }

  private static createBaseElements() {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    const textElement = document.createElement('div');
    textElement.classList.add('message-text');
    innerContainer.appendChild(textElement);
    return {outerContainer, innerContainer, textElement};
  }

  private createMessageElements(text: string, isAI: boolean) {
    const {outerContainer, innerContainer, textElement} = Messages.createBaseElements();
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(textElement, text, isAI);
    if (this._messageStyles) {
      Messages.applyCustomStyles(outerContainer, innerContainer, textElement, this._messageStyles, isAI);
    }
    this._textElementRefs.push(textElement);
    this.messages.push(Messages.createMessageContent(text, isAI));
    return outerContainer;
  }

  public sendClientUpdate(text: string, isAI: boolean) {
    const messageContent = Messages.createMessageContent(text, isAI);
    this._onNewMessage?.(messageContent);
    this._dispatchEvent(new CustomEvent('new-message', {detail: messageContent}));
  }

  private removeStreamedMessageIfEmpty() {
    const lastMessage = this._textElementRefs[this._textElementRefs.length - 1];
    if (lastMessage.classList.contains('streamed-message') && lastMessage.textContent === '') {
      lastMessage.remove();
      this._textElementRefs.pop();
    }
  }

  public addNewErrorMessage() {
    this.removeStreamedMessageIfEmpty();
    const text = this._customErrorMessage?.text || 'Error, please try again.';
    const {outerContainer, innerContainer, textElement} = Messages.createBaseElements();
    textElement.classList.add('error-message-text');
    textElement.innerHTML = text;
    if (this._customErrorMessage?.styles) {
      Messages.applyCustomStylesToElements(outerContainer, innerContainer, textElement, this._customErrorMessage.styles);
    }
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    if (this._speechOutput) TextToSpeech.speak(text);
  }

  public addNewMessage(text: string, isAI: boolean, update = true) {
    // this statement will not be necessary if there is nomplaceholder
    if (this._textElementRefs.length === 0) this.elementRef.replaceChildren();
    const messageElement = this.createMessageElements(text, isAI);
    this.elementRef.appendChild(messageElement);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    if (this._speechOutput && isAI) TextToSpeech.speak(text);
    if (update) this.sendClientUpdate(text, isAI);
  }

  public addNewStreamedMessage() {
    this.addNewMessage('', true, false);
    const streamedMessage = this._textElementRefs[this._textElementRefs.length - 1];
    streamedMessage.classList.add('streamed-message');
    return streamedMessage;
  }

  public static updateStreamedMessage(text: string, textElement: HTMLElement) {
    const textNode = document.createTextNode(text);
    textElement.appendChild(textNode);
  }
}
