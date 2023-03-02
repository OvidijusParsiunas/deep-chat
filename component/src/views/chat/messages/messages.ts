import {CustomMessageStyles, CustomMessageStyle} from '../../../types/messages';
import {Avatars} from '../../../types/avatar';
import {Avatar} from './avatar';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  <div class="messages">
    <div id="placeholder">
      <div id="placeholder-text">
        Ai Assistant
      </div>
    </div>
  </div>
`;

export type AddNewMessage = Messages['addNewMessage'];

export class Messages {
  private readonly _elementRef: HTMLElement;
  private readonly _textElementRefs: HTMLElement[] = [];
  private readonly _messageStyles?: CustomMessageStyles;
  private readonly _avatars?: Avatars;

  constructor(parentElement: HTMLElement, messageStyle?: CustomMessageStyles, avatars?: Avatars) {
    parentElement.appendChild(messagesTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('messages')[0] as HTMLElement;
    this._messageStyles = messageStyle;
    this._avatars = avatars;
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

  private addInnerContainerElements(innerContainer: HTMLElement, text: string, isAI: boolean) {
    const textElement = document.createElement('div');
    textElement.classList.add('message-text', isAI ? 'ai-message-text' : 'user-message-text');
    textElement.innerHTML = text;
    innerContainer.appendChild(textElement);
    if (this._avatars) Avatar.addAvatar(textElement, isAI, this._avatars);
    return {textElement};
  }

  private createMessageElements(text: string, isAI: boolean) {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    const {textElement} = this.addInnerContainerElements(innerContainer, text, isAI);
    if (this._messageStyles) {
      Messages.applyCustomStyles(outerContainer, innerContainer, textElement, this._messageStyles, isAI);
    }
    this._textElementRefs.push(textElement);
    return outerContainer;
  }

  public addNewMessage(text: string, isAI: boolean) {
    if (this._textElementRefs.length === 0) this._elementRef.replaceChildren();
    const messageElement = this.createMessageElements(text, isAI);
    this._elementRef.appendChild(messageElement);
    this._elementRef.scrollTop = this._elementRef.scrollHeight;
  }

  public addNewStreamedMessage() {
    this.addNewMessage('', true);
    return this._textElementRefs[this._textElementRefs.length - 1];
  }

  public static updateStreamedMessage(text: string, textElement: HTMLElement) {
    const textNode = document.createTextNode(text);
    textElement.appendChild(textNode);
  }
}
