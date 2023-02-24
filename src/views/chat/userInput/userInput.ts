import {AddNewMessage} from '../messages/messages';
import {userInputStyle} from './userInputStyle';
import {OpenAIClient} from './openAIClient';

const inputTemplate = document.createElement('template');
inputTemplate.innerHTML = `
  ${userInputStyle}
  <div class="user-input"></div>
`;

export class UserInput {
  private readonly _elementRef: HTMLElement;

  constructor(parentElement: HTMLElement, key: string, addNewMessage: AddNewMessage) {
    parentElement.appendChild(inputTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('user-input')[0] as HTMLElement;
    this.buildElements(key, addNewMessage);
  }

  private buildElements(key: string, addNewMessage: AddNewMessage) {
    const inputElement = this.createInputElement();
    this._elementRef.appendChild(inputElement);
    const buttonElement = this.createButtonElement(key, addNewMessage, inputElement);
    this._elementRef.appendChild(buttonElement);
  }

  private createInputElement() {
    const inputElement = document.createElement('input');
    inputElement.id = 'input';
    return inputElement;
  }

  private createButtonElement(key: string, addNewMessage: AddNewMessage, inputElement: HTMLInputElement) {
    const buttonElement = document.createElement('button');
    buttonElement.innerText = 'Call';
    buttonElement.id = 'submit-button';
    buttonElement.onmousedown = this.callApi.bind(this, key, inputElement, addNewMessage);
    return buttonElement;
  }

  private callApi(key: string, inputElement: HTMLInputElement, addNewMessage: AddNewMessage) {
    const inputText = inputElement.value.trim();
    if (inputText === '') return;
    addNewMessage(inputText);
    OpenAIClient.requestCompletion(key, inputText, addNewMessage);
  }
}
