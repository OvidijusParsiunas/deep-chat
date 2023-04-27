import {PermittedErrorMessage} from '../../../types/permittedErrorMessage';
import {MessageFile, MessageFileType} from '../../../types/messageFile';
import {ElementUtils} from '../../../utils/element/elementUtils';
import {RemarkableConfig} from './remarkable/remarkableConfig';
import {Result as MessageData} from '../../../types/result';
import {TextToSpeech} from './textToSpeech/textToSpeech';
import {CustomErrors} from '../../../services/serviceIO';
import {Browser} from '../../../utils/browser/browser';
import {IntroPanel} from '../introPanel/introPanel';
import {CustomStyle} from '../../../types/styles';
import {AiAssistant} from '../../../aiAssistant';
import {Avatars} from '../../../types/avatar';
import {Names} from '../../../types/names';
import {Remarkable} from 'remarkable';
import {Avatar} from './avatar';
import {Name} from './name';
import {
  ErrorMessageOverrides,
  MessageElementStyles,
  MessageContent,
  MessageStyles,
  OnNewMessage,
} from '../../../types/messages';

interface MessageElements {
  outerContainer: HTMLElement;
  innerContainer: HTMLElement;
  bubbleElement: HTMLElement;
}

export class Messages {
  elementRef: HTMLElement;
  private readonly _messageElementRefs: MessageElements[] = [];
  private readonly _messageStyles?: MessageStyles;
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
    this._messageStyles = aiAssistant.messageStyles;
    this._avatars = aiAssistant.avatars;
    this._names = aiAssistant.names;
    this._errorMessageOverrides = aiAssistant.errorMessageOverrides;
    this._speechOutput = aiAssistant.speechOutput;
    this._dispatchEvent = aiAssistant.dispatchEvent.bind(aiAssistant);
    this._onNewMessage = aiAssistant.onNewMessage;
    this._displayLoadingMessage = aiAssistant.displayLoadingMessage ?? true;
    this._permittedErrorPrefixes = permittedErrorPrefixes;
    if (aiAssistant.introMessage) this.addIntroductoryMessage(aiAssistant.introMessage);
    if (aiAssistant.initialMessages) this.populateInitialMessages(aiAssistant.initialMessages);
    // this.addNewMessage(
    //   [
    //     {
    //       url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Fischotter%2C_Lutra_Lutra.JPG',
    //       // base64: `data:image/png;base64,${SAMPLE_OPEN_AI_BASE_64}`,
    //     },
    //   ],
    //   true,
    //   true
    // );
    aiAssistant.getMessages = () => this.messages;
    this.populateIntroPanel(aiAssistant._isSlotPopulated, introPanelMarkUp, aiAssistant.introPanelStyle);
  }

  private static createContainerElement() {
    const container = document.createElement('div');
    container.id = 'messages';
    return container;
  }

  private addIntroductoryMessage(introMessage: string) {
    const {outerContainer, innerContainer, bubbleElement} = this.createAndAppendNewMessageElement(introMessage, true);
    const intrStyle = this._messageStyles?.intro;
    if (intrStyle) Messages.applyCustomStylesToElements(outerContainer, innerContainer, bubbleElement, intrStyle);
  }

  private populateInitialMessages(initialMessages: MessageContent[]) {
    initialMessages.forEach((message) => {
      if (message.text) {
        this.addNewMessage({text: message.text}, message.role === 'assistant', true, true);
      } else if (message.file) {
        this.addNewMessage({files: [message.file]}, message.role === 'assistant', true, true);
      }
    });
  }

  // prettier-ignore
  private static applyCustomStylesToElements(outerC: HTMLElement, innerC: HTMLElement,
      bubble: HTMLElement, style: MessageElementStyles) {
    Object.assign(outerC.style, style.outerContainer);
    Object.assign(innerC.style, style.innerContainer);
    Object.assign(bubble.style, style.bubble);
  }

  // prettier-ignore
  private static applyCustomStyles(outerC: HTMLElement, innerC: HTMLElement,
      bubble: HTMLElement, styles: MessageStyles, isAI: boolean) {
    if (styles.default) Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.default);
    if (isAI) {
      if (styles.ai) Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.ai);
    } else if (styles.user) {
      Messages.applyCustomStylesToElements(outerC, innerC, bubble, styles.user);
    }
  }

  private addInnerContainerElements(bubbleElement: HTMLElement, text: string, isAI: boolean) {
    bubbleElement.classList.add('message-bubble', isAI ? 'ai-message-text' : 'user-message-text');
    bubbleElement.innerHTML = this._remarkable.render(text);
    if (this._avatars) Avatar.add(bubbleElement, isAI, this._avatars);
    if (this._names) Name.add(bubbleElement, isAI, this._names);
    return {bubbleElement};
  }

  private static createMessageContent(isAI: boolean, text?: string, file?: MessageFile): MessageContent {
    if (file) {
      return {role: isAI ? 'assistant' : 'user', file};
    }
    return {role: isAI ? 'assistant' : 'user', text: text || ''};
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
    if (this._messageStyles) {
      Messages.applyCustomStyles(outerContainer, innerContainer, bubbleElement, this._messageStyles, isAI);
    }
    this._messageElementRefs.push(messageElements);
    return messageElements;
  }

  private createNewMessageElement(text: string, isAI: boolean) {
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

  private addNewTextMessage(text: string, isAI: boolean, update: boolean, isInitial = false) {
    const messageElements = this.createAndAppendNewMessageElement(text, isAI);
    const messageContent = Messages.createMessageContent(isAI, text);
    this.messages.push(messageContent);
    if (update) this.sendClientUpdate(messageContent, isInitial);
    return messageElements;
  }

  public addNewMessage(data: MessageData, isAI: boolean, update: boolean, isInitial = false) {
    if (data.text) {
      this.addNewTextMessage(data.text, isAI, update, isInitial);
    }
    data.files?.forEach((fileData) => {
      // extra checks are used for 'file'
      if (fileData.type === 'audio' || fileData.base64?.startsWith('data:audio')) {
        this.addNewAudioMessage(fileData, isAI, isInitial);
      } else if (fileData.type === 'image' || fileData.base64?.startsWith('data:image')) {
        this.addNewImageMessage(fileData, isAI, isInitial);
      }
    });
  }

  private sendClientUpdate(message: MessageContent, isInitial = false) {
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
    const {outerContainer, innerContainer, bubbleElement} = Messages.createBaseElements();
    bubbleElement.classList.add('error-message-text');
    const text = this.getPermittedMessage(message) || this._errorMessageOverrides?.[type]
      || this._errorMessageOverrides?.default || 'Error, please try again.';
    bubbleElement.innerHTML = text;
    const errStyle = this._messageStyles?.error;
    if (errStyle) Messages.applyCustomStylesToElements(outerContainer, innerContainer, bubbleElement, errStyle);
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    if (this._speechOutput && window.SpeechSynthesisUtterance) TextToSpeech.speak(text);
    this._streamedText = '';
  }

  private getPermittedMessage(message?: string | PermittedErrorMessage) {
    if (message) {
      if (typeof message === 'string' && this._permittedErrorPrefixes) {
        const errorPrefixes = Array.from(this._permittedErrorPrefixes);
        for (let i = 0; i < errorPrefixes.length; i += 1) {
          if (message.startsWith(errorPrefixes[i])) return message;
        }
      } else if (typeof message === 'object' && message.permittedErrorMessage) {
        return message.permittedErrorMessage;
      }
    }
    return undefined;
  }

  public addLoadingMessage() {
    if (!this._displayLoadingMessage) return;
    const {outerContainer, innerContainer, bubbleElement} = this.createMessageElements('', true);
    bubbleElement.classList.add('loading-message-text');
    const loadStyle = this._messageStyles?.loading;
    if (loadStyle) Messages.applyCustomStylesToElements(outerContainer, innerContainer, bubbleElement, loadStyle);
    const dotsElement = document.createElement('div');
    dotsElement.classList.add('dots-flashing');
    bubbleElement.appendChild(dotsElement);
    Object.assign(dotsElement.style, this._messageStyles?.default?.media);
    Object.assign(dotsElement.style, this._messageStyles?.loading?.media);
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
        const reader = new FileReader();
        reader.readAsDataURL(fileData.file);
        return new Promise((resolve) => {
          reader.onload = () => {
            this.addNewMessage({files: [{base64: reader.result as string, type: fileData.type}]}, false, true);
            resolve(true);
          };
        });
      })
    );
  }

  private createImage(imageData: MessageFile, isAI: boolean) {
    const data = (imageData.url || imageData.base64) as string;
    const imageElement = new Image();
    imageElement.src = data;
    Object.assign(imageElement.style, this._messageStyles?.default?.media);
    Object.assign(imageElement.style, isAI ? this._messageStyles?.ai?.media : this._messageStyles?.user?.media);
    if (imageData.base64) return imageElement;
    const linkWrapperElement = document.createElement('a');
    linkWrapperElement.href = imageData.url as string;
    linkWrapperElement.target = '_blank';
    linkWrapperElement.appendChild(imageElement);
    return linkWrapperElement;
  }

  private addNewImageMessage(imageData: MessageFile, isAI: boolean, isInitial = false) {
    const {outerContainer, bubbleElement: imageContainer} = this.createNewMessageElement('', isAI);
    const image = this.createImage(imageData, isAI);
    imageContainer.appendChild(image);
    imageContainer.classList.add('image-message');
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    // TO-DO - not sure if this scrolls down properly when the image is still being rendered
    const fileObject = imageData.url ? {type: 'image', url: imageData.url} : {type: 'image', base64: imageData.base64};
    const messageContent = Messages.createMessageContent(true, undefined, fileObject as MessageFile);
    this.messages.push(messageContent);
    this.sendClientUpdate(messageContent, isInitial);
  }

  private static createAudioElement(data: string) {
    const audioElement = document.createElement('audio');
    audioElement.src = data;
    audioElement.classList.add('audio-player');
    audioElement.controls = true;
    if (Browser.IS_SAFARI) audioElement.classList.add('audio-player-safari');
    return audioElement;
  }

  private addNewAudioMessage(audioData: MessageFile, isAI: boolean, isInitial = false) {
    const {outerContainer, bubbleElement: audioContainer} = this.createNewMessageElement('', isAI);
    const data = audioData.base64 as string;
    const audioElement = Messages.createAudioElement(data);
    audioContainer.appendChild(audioElement);
    audioContainer.classList.add('audio-message');
    this.elementRef.appendChild(outerContainer);
    this.elementRef.scrollTop = this.elementRef.scrollHeight;
    const messageContent = Messages.createMessageContent(true, undefined, {type: 'audio', base64: data});
    this.messages.push(messageContent);
    this.sendClientUpdate(messageContent, isInitial);
  }
}
