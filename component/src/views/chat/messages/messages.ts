import {CustomMessageStyles, CustomMessageStyle} from '../../../types/messages';
import {CustomAvatarStyles} from '../../../types/avatar';
import {Avatar} from './avatar';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  <div class="messages">
    <div id="placeholder">
      <div id="placeholder-text">
        AI Assistant
      </div>
    </div>
  </div>
`;

export type AddNewMessage = Messages['addNewMessage'];

export class Messages {
  private readonly _elementRef: HTMLElement;
  private readonly _textElementRefs: HTMLElement[] = [];

  constructor(parentElement: HTMLElement) {
    parentElement.appendChild(messagesTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('messages')[0] as HTMLElement;
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

  private static addInnerContainerElements(innerContainer: HTMLElement, text: string, isAI: boolean) {
    const textElement = document.createElement('div');
    textElement.classList.add('message-text', isAI ? 'ai-message-text' : 'user-message-text');
    textElement.innerHTML = text;
    innerContainer.appendChild(textElement);
    if (Avatar.canAvatarBeAdded(Messages._avatarStyles)) Avatar.addAvatar(textElement, Messages._avatarStyles, isAI);
    return {textElement};
  }

  private createMessageElements(text: string, isAI: boolean) {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    outerContainer.appendChild(innerContainer);
    const {textElement} = Messages.addInnerContainerElements(innerContainer, text, isAI);
    Messages.applyCustomStyles(outerContainer, innerContainer, textElement, Messages._openAIStyles, isAI);
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

  private static readonly _avatarStyles: CustomAvatarStyles = {
    default: {
      container: {
        margin: '10px',
      },
      avatar: {
        padding: 'unset',
      },
      position: 'left',
    },
  };

  private static readonly _openAIStyles: CustomMessageStyles = {
    default: {
      outerContainer: {
        borderBottom: '1px solid #c3c3c3',
      },
      innerContainer: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      text: {
        color: 'rgba(52, 53, 65)',
        margin: 'unset',
        padding: 'unset',
        maxWidth: 'unset',
        border: 'unset',
        paddingTop: '10px',
        paddingBottom: '10px',
        width: 'inherit',
        backgroundColor: 'unset',
      },
    },
    user: {
      outerContainer: {
        backgroundColor: 'white',
      },
    },
    ai: {
      outerContainer: {
        backgroundColor: '#d9d9e3cc',
      },
    },
  };
}
