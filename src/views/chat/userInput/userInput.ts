import {SVGIconUtil} from '../../../utils/svgIconUtil';
import {AddNewMessage} from '../messages/messages';
import {userInputStyle} from './userInputStyle';
import {SUBMIT_ICON_STRING} from './submitIcon';
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
    const containerElement = this.createContainerElement();
    const inputElement = this.createInputElement();
    containerElement.appendChild(inputElement);
    const buttonElement = this.createButtonElement(key, addNewMessage, inputElement);
    containerElement.appendChild(buttonElement);
    this._elementRef.appendChild(containerElement);
  }

  private createContainerElement() {
    const contentContainerElement = document.createElement('div');
    contentContainerElement.id = 'input-content-container';
    return contentContainerElement;
  }

  private createInputElement() {
    const inputElement = document.createElement('div');
    inputElement.id = 'input';
    inputElement.contentEditable = 'true';
    return inputElement;
  }

  private createButtonElement(key: string, addNewMessage: AddNewMessage, inputElement: HTMLElement) {
    const buttonElement = document.createElement('div');
    const svgIconElement = SVGIconUtil.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'icon';
    buttonElement.appendChild(svgIconElement);
    buttonElement.id = 'submit-button';
    buttonElement.onmousedown = this.callApi.bind(this, key, inputElement, addNewMessage);
    return buttonElement;
  }

  private callApi(key: string, inputElement: HTMLElement, addNewMessage: AddNewMessage) {
    const inputText = inputElement.textContent?.trim();
    if (!inputText || inputText === '') return;
    OpenAIClient.requestCompletion(key, inputText, addNewMessage);
  }
}
