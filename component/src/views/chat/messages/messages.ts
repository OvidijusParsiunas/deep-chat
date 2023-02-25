import imgUrl from '../../../../assets/open-ai-logo.png';
import {messagesStyle} from './messagesStyle';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  ${messagesStyle}
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
  }

  private createAvatar() {
    const avatar = document.createElement('img');
    avatar.src = imgUrl;
    avatar.classList.add('avatar');
    const avatarContainer = document.createElement('div');
    avatarContainer.classList.add('avatar-container');
    avatarContainer.appendChild(avatar);
    return avatarContainer;
  }

  private createNewMessage(text: string) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    messageContainer.style.backgroundColor = this._messages.length % 2 === 0 ? 'white' : '#d9d9e3cc';
    const message = document.createElement('div');
    message.classList.add('message');
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = text;
    message.appendChild(this.createAvatar());
    message.appendChild(messageText);
    messageContainer.appendChild(message);
    return messageContainer;
  }

  public addNewMessage(text: string) {
    if (this._messages.length === 0) this._elementRef.replaceChildren();
    this._elementRef.appendChild(this.createNewMessage(text));
    this._elementRef.scrollTop = this._elementRef.scrollHeight;
    this._messages.push(text);
  }
}
