import {messageStyle} from './messageStyle';

const messagesTemplate = document.createElement('template');
messagesTemplate.innerHTML = `
  ${messageStyle}
  <div class="messages"></div>
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
    this._elementRef.appendChild(this.createNewMessage(text));
    this._messages.push(text);
  }
}
