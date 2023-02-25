import {CompletionResult, OpenAIClient} from './openAIClient';
import {SVGIconUtil} from '../../../utils/svgIconUtil';
import {AddNewMessage} from '../messages/messages';
import {userInputStyle} from './userInputStyle';
import {SUBMIT_ICON_STRING} from './submitIcon';
import {loadingIconStyle} from './loadingIcon';
import {PasteUtils} from './pasteUtils';

const inputTemplate = document.createElement('template');
inputTemplate.innerHTML = `
  ${loadingIconStyle}
  ${userInputStyle}
  <div class="user-input"></div>
`;

export class UserInput {
  private readonly _key: string;
  private readonly _addNewMessage: AddNewMessage;
  private readonly _elementRef: HTMLElement;
  private readonly _inputElementRef: HTMLElement;
  private readonly _buttonContainerElementRef: HTMLElement;
  private readonly _buttonElementRef: HTMLElement;
  private readonly _loadingElementRef: HTMLElement;

  constructor(parentElement: HTMLElement, key: string, addNewMessage: AddNewMessage) {
    parentElement.appendChild(inputTemplate.content.cloneNode(true));
    this._elementRef = parentElement.getElementsByClassName('user-input')[0] as HTMLElement;
    this._key = key;
    this._addNewMessage = addNewMessage;
    const {inputElement, buttonContainerElement} = this.addElements();
    this._inputElementRef = inputElement;
    this._buttonContainerElementRef = buttonContainerElement;
    this._buttonElementRef = this._buttonContainerElementRef.children[0] as HTMLElement;
    this._loadingElementRef = this.createLoadingElement();
  }

  private addElements() {
    const containerElement = this.createContainerElement();
    const inputElement = this.createInputElement();
    containerElement.appendChild(inputElement);
    this._elementRef.appendChild(containerElement);
    const buttonContainerElement = this.createButtonElement();
    this._elementRef.appendChild(buttonContainerElement);
    return {inputElement, buttonContainerElement};
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
    const buttonContainerElement = document.createElement('div');
    buttonContainerElement.id = 'submit-button-container';
    buttonContainerElement.appendChild(buttonElement);
    return buttonContainerElement;
  }

  private createLoadingElement() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('dot-typing');
    return loadingElement;
  }

  private submit() {
    const inputText = this._inputElementRef.textContent?.trim();
    this.changeToLoadingIcon();
    if (!inputText || inputText === '') return;
    this._addNewMessage(inputText as string);
    OpenAIClient.requestCompletion(this._key, inputText, this.onSuccessfulResult.bind(this));
    this._inputElementRef.textContent = '';
  }

  private onSuccessfulResult(result: CompletionResult) {
    this._addNewMessage(result.choices[0].text);
    this.changeToSubmitIcon();
  }

  private changeToLoadingIcon() {
    this._buttonContainerElementRef.replaceChild(this._loadingElementRef, this._buttonElementRef);
  }

  private changeToSubmitIcon() {
    this._buttonContainerElementRef.replaceChild(this._buttonElementRef, this._loadingElementRef);
  }
}
