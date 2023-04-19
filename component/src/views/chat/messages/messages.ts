import {ImageResult, ImageResults} from '../../../types/imageResult';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {AiAssistant} from '../../../aiAssistant';
import {Avatars} from '../../../types/avatar';
import {Names} from '../../../types/names';
import {Remarkable} from 'remarkable';
import {Avatar} from './avatar';
import {Name} from './name';
import {
  CustomMessageStyles,
  CustomMessageStyle,
  MessageContent,
  ErrorMessages,
  OnNewMessage,
  IntroMessage,
} from '../../../types/messages';

interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

type ContentTypes = 'text' | 'image';

export class Messages {
  elementRef: HTMLElement;
  private readonly _messageElementRefs: MessageElements[] = [];

  private readonly _messageStyles?: CustomMessageStyles;
  private readonly _avatars?: Avatars;
  private readonly _names?: Names;
  private readonly _customErrorMessage?: ErrorMessages;
  private readonly _onNewMessage?: OnNewMessage;
  private readonly _dispatchEvent: (event: Event) => void;
  private readonly _speechOutput?: boolean;
  private readonly _displayLoadingMessage?: boolean;
  private readonly _remarkable: Remarkable;
  private _streamedText = '';
  messages: MessageContent[] = [];

  constructor(aiAssistant: AiAssistant) {
    this._remarkable = RemarkableConfig.createNew();
    this.elementRef = Messages.createContainerElement();
    this._messageStyles = aiAssistant.messageStyles;
    this._avatars = aiAssistant.avatars;
    this._names = aiAssistant.names;
    this._customErrorMessage = aiAssistant.errorMessage;
    this._speechOutput = aiAssistant.speechOutput;
    this._dispatchEvent = aiAssistant.dispatchEvent.bind(aiAssistant);
    this._onNewMessage = aiAssistant.onNewMessage;
    this._displayLoadingMessage = aiAssistant.displayLoadingMessage ?? true;
    if (aiAssistant.introMessage) this.addIntroductoryMessage(aiAssistant.introMessage);
    if (aiAssistant.initialMessages) this.populateInitialMessages(aiAssistant.initialMessages);
    // this.addNewMessage(
    //   [
    //     {
    //       // url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Fischotter%2C_Lutra_Lutra.JPG',
    //       base64: `data:image/png;base64,${SAMPLE_OPEN_AI_BASE_64}`,
    //     },
    //   ],
    //   true,
    //   true
    // );
    aiAssistant.getMessages = () => this.messages;
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
    return container;
  }

  // prettier-ignore
  private addIntroductoryMessage(introMessage: IntroMessage) {
    const {outerContainer, innerContainer, bubbleElement} = this.createAndAppendNewMessageElement(
      introMessage.content || '', true);
    if (introMessage.styles) {
      Messages.applyCustomStylesToElements(outerContainer, innerContainer, bubbleElement, introMessage.styles, 'text');
    }
  }

  private populateInitialMessages(initialMessages: MessageContent[]) {
    initialMessages.forEach(({role, content}) => {
      this.addNewMessage(content, role === 'assistant', true, true);
    });
  }

  // prettier-ignore
  private static applyCustomStylesToElements(outerC: HTMLElement, innerC: HTMLElement,
      bubble: HTMLElement, style: CustomMessageStyle, messageType: ContentTypes) {
    Object.assign(outerC.style, style.outerContainer);
    Object.assign(innerC.style, style.innerContainer);
    Object.assign(bubble.style, style.bubble);
    if (messageType === 'text') Object.assign(bubble.style, style.text);
  }

  // prettier-ignore
  private static applyCustomStyles(outerC: HTMLElement, innerC: HTMLElement,
      bubble: HTMLElement, styles: CustomMessageStyles, isAI: boolean, messageType: ContentTypes) {
    if (styles.default) Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.default, messageType);
    if (isAI) {
      if (styles.ai) Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.ai, messageType);
    } else if (styles.user) {
      Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.user, messageType);
    }
  }

  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, isAI: boolean) {
    bubbleElement.classList.add('message-bubble', isAI ? 'ai-message-text' : 'user-message-text');
    bubbleElement.innerHTML = this._remarkable.render(text);
    if (this._avatars) Avatar.add(bubbleElement, isAI, this._avatars);
    if (this._names) Name.add(bubbleElement, isAI, this._names);
    return {bubbleElement};
  }

  private static createMessageContent(text: string, isAI: boolean) {
    return {role: isAI ? 'assistant' : 'user', content: text} as const;
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

  private createMessageElements(text: string, isAI: boolean, messageType: ContentTypes = 'text') {
    const messageElements = Messages.createBaseElements();
    const {outerContainer, innerContainer, bubbleElement} = messageElements;
    outerContainer.appendChild(innerContainer);
    this.addInnerContainerElements(bubbleElement, text, isAI);
    if (this._messageStyles) {
      Messages.applyCustomStyles(outerContainer, innerContainer, bubbleElement, this._messageStyles, isAI, messageType);
    }
    this._messageElementRefs.push(messageElements);
    return messageElements;
  }

  private createNewMessageElement(text: string, isAI: boolean, messageType: ContentTypes = 'text') {
    const lastMessageElements = this._messageElementRefs[this._messageElementRefs.length - 1];
    if (isAI && lastMessageElements?.bubbleElement.classList.contains('loading-message-text')) {
      lastMessageElements.bubbleElement.classList.remove('loading-message-text');
      lastMessageElements.bubbleElement.innerHTML = this._remarkable.render(text);
      return lastMessageElements;
    }
    return this.createMessageElements(text, isAI, messageType);
  }

  private createAndAppendNewMessageElement(text: string, isAI: boolean) {
    const messageElements = this.createNewMessageElement(text, isAI);
    this.elementRef.appendChild(messageElements.outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    if (this._speechOutput && isAI) TextToSpeech.speak(text);
    return messageElements;
  }

  private addNewTextMessage(text: string, isAI: boolean, update: boolean, isInitial = false) {
    const messageElements = this.createAndAppendNewMessageElement(text, isAI);
    this.messages.push(Messages.createMessageContent(text, isAI));
    if (update) this.sendClientUpdate(text, isAI, isInitial);
    return messageElements;
  }

  public addNewMessage(data: string | ImageResults, isAI: boolean, update: boolean, isInitial = false) {
    if (typeof data === 'string') {
      this.addNewTextMessage(data, isAI, update, isInitial);
    } else {
      data.forEach((imageData) => this.addNewImageMessage(imageData, isAI));
    }
  }

  private sendClientUpdate(text: string, isAI: boolean, isInitial = false) {
    const message = Messages.createMessageContent(text, isAI);
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
  public addNewErrorMessage(type: keyof Omit<ErrorMessages, 'default'>, message?: string) {
    this.removeMessageOnError();
    const {outerContainer, innerContainer, bubbleElement} = Messages.createBaseElements();
    bubbleElement.classList.add('error-message-text');
    const text = this._customErrorMessage?.[type]?.text || this._customErrorMessage?.default?.text ||
      message || 'Error, please try again.';
    bubbleElement.innerHTML = text;
    const styles = this._customErrorMessage?.[type]?.styles || this._customErrorMessage?.default?.styles;
    if (styles) Messages.applyCustomStylesToElements(outerContainer, innerContainer, bubbleElement, styles, 'text');
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    if (this._speechOutput && window.SpeechSynthesisUtterance) TextToSpeech.speak(text);
    this._streamedText = '';
  }

  public addLoadingMessage() {
    if (!this._displayLoadingMessage) return;
    const {outerContainer, bubbleElement} = this.createMessageElements('', true);
    bubbleElement.classList.add('loading-message-text');
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('dots-flashing');
    bubbleElement.appendChild(dotsElement);
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
    this.sendClientUpdate(text, true);
    if (this._speechOutput && window.SpeechSynthesisUtterance) TextToSpeech.speak(text);
    this._streamedText = '';
  }

  private createImage(imageData: ImageResult, isAI: boolean) {
    const data = (imageData.url || imageData.base64) as string;
    const imageElement = new Image();
    imageElement.src = data;
    Object.assign(imageElement.style, this._messageStyles?.default?.image);
    Object.assign(imageElement.style, isAI ? this._messageStyles?.ai?.image : this._messageStyles?.user?.image);
    if (imageData.base64) return imageElement;
    const linkWrapperElement = document.createElement('a');
    linkWrapperElement.href = imageData.url as string;
    linkWrapperElement.target = '_blank';
    linkWrapperElement.appendChild(imageElement);
    return linkWrapperElement;
  }

  private addNewImageMessage(imageData: ImageResult, isAI: boolean, isInitial = false) {
    const {outerContainer, bubbleElement: imageContainer} = this.createNewMessageElement('', isAI, 'image');
    const data = (imageData.url || imageData.base64) as string;
    const image = this.createImage(imageData, isAI);
    imageContainer.appendChild(image);
    imageContainer.classList.add('image-message');
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    this.messages.push(Messages.createMessageContent(data, true));
    this.sendClientUpdate(data, true, isInitial);
  }

  async addMultipleImagesFromFiles(files: File[]) {
    return Promise.all(
      (files || []).map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = () => {
            this.addNewMessage([{base64: reader.result as string}], false, true);
            resolve(true);
          };
        });
      })
    );
  }
}
