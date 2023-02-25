import {messagesStyle} from './messagesStyle';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  ${messagesStyle}
  <div class="messages">
    <div id="placeholder">
      <div id="placeholder-text">
        Placeholder text
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

  private createNewMessage(text: string) {
    const message = document.createElement('div');
    message.classList.add('message');
    message.style.backgroundColor = this._messages.length % 2 === 0 ? 'white' : '#d9d9e3cc';
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = text;
    message.appendChild(messageText);
    return message;
  }

  public addNewMessage(text: string) {
    if (this._messages.length === 0) {
      this._elementRef.replaceChildren();
    }
    this._elementRef.appendChild(this.createNewMessage(text));
    this._elementRef.scrollTop = this._elementRef.scrollHeight;
    this._messages.push(text);
  }
}
