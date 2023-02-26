import {CustomAvatarStyles, CustomMessageStyles, CustomMessageStyle} from '../../../types/messages';
import style from './messages.css?inline';
import {Avatar} from './avatar';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  <style>${style}</style>
  <div class="messages">
    <div id="placeholder">
      <div id="placeholder-text">
        Real Ai
      </div>
    </div>
  </div>
`;

export type AddNewMessage = Messages['addNewMessage'];

export class Messages {
  private readonly _elementRef: HTMLElement;
  private readonly _messages: string[] = [];
  constructor(parentElement: HTMLElement) {
    parentElement.appendChild(messagesTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('messages')[0] as HTMLElement;
    if (Avatar.canAvatarBeAdded(Messages._avatarStyles)) {
      Avatar.appendDefaultStyle(this._elementRef.parentElement as HTMLElement);
    }
  }

  // prettier-ignore
  private static applyCustomStylesViaState(outerC: HTMLElement, innerC: HTMLElement, text: HTMLElement, style: CustomMessageStyle) {
    Object.assign(outerC.style, style.outerContainer);
    Object.assign(innerC.style, style.innerContainer);
    Object.assign(text.style, style.text);
  }

  // prettier-ignore
  private static applyCustomStyles(outerC: HTMLElement, innerC: HTMLElement, text: HTMLElement, styles: CustomMessageStyles, isAI: boolean) {
    if (styles.default) Messages.applyCustomStylesViaState(outerC, innerC, text, styles.default);
    if (isAI) {
      if (styles.ai) Messages.applyCustomStylesViaState(outerC, innerC, text, styles.ai);
    } else if (styles.user) {
      Messages.applyCustomStylesViaState(outerC, innerC, text, styles.user);
    }
  }

  private createNewMessage(text: string, isAI: boolean) {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('inner-message-container');
    const messageText = document.createElement('div');
    messageText.classList.add('message-text', isAI ? 'ai-message-text' : 'user-message-text');
    messageText.innerHTML = text;
    innerContainer.appendChild(messageText);
    Avatar.addAvatar(messageText, Messages._avatarStyles, isAI);
    outerContainer.appendChild(innerContainer);
    if (Avatar.canAvatarBeAdded(Messages._avatarStyles)) {
      Messages.applyCustomStyles(outerContainer, innerContainer, messageText, Messages._openAIStyles, isAI);
    }
    return outerContainer;
  }

  public addNewMessage(text: string, isAI: boolean) {
    if (this._messages.length === 0) this._elementRef.replaceChildren();
    this._elementRef.appendChild(this.createNewMessage(text, isAI));
    this._elementRef.scrollTop = this._elementRef.scrollHeight;
    this._messages.push(text);
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
