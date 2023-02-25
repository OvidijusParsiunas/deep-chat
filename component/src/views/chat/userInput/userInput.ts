import {SVGIconUtil} from '../../../utils/svgIconUtil';
import {AddNewMessage} from '../messages/messages';
import {userInputStyle} from './userInputStyle';
import {SUBMIT_ICON_STRING} from './submitIcon';
import {OpenAIClient} from './openAIClient';
import {PasteUtils} from './pasteUtils';

const inputTemplate = document.createElement('template');
inputTemplate.innerHTML = `
  ${userInputStyle}
  <div class="user-input"></div>
`;

export class UserInput {
  private readonly _elementRef: HTMLElement;
  private readonly _key: string;
  private readonly _addNewMessage: AddNewMessage;
  private readonly _inputElementRef: HTMLElement;

  constructor(parentElement: HTMLElement, key: string, addNewMessage: AddNewMessage) {
    parentElement.appendChild(inputTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('user-input')[0] as HTMLElement;
    this._key = key;
    this._addNewMessage = addNewMessage;
    this._inputElementRef = this.buildElements().inputElement;
  }

  private buildElements() {
    const containerElement = this.createContainerElement();
    const inputElement = this.createInputElement();
    containerElement.appendChild(inputElement);
    this._elementRef.appendChild(containerElement);
    const buttonElement = this.createButtonElement();
    this._elementRef.appendChild(buttonElement);
    return {inputElement};
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
    inputElement.onpaste = PasteUtils.sanitizePastedTextContent;
    inputElement.onkeydown = this.onKeydown.bind(this);
    return inputElement;
  }

  private onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  private createButtonElement() {
    const buttonElement = document.createElement('div');
    const svgIconElement = SVGIconUtil.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'icon';
    buttonElement.appendChild(svgIconElement);
    buttonElement.id = 'submit-button';
    buttonElement.onmousedown = this.submit.bind(this);
    return buttonElement;
  }

  private submit() {
    const inputText = this._inputElementRef.textContent?.trim();
    this._addNewMessage(inputText as string);
    if (!inputText || inputText === '') return;
    // OpenAIClient.requestCompletion(this._key, inputText, this._addNewMessage);
    this._inputElementRef.textContent = '';
  }
}
