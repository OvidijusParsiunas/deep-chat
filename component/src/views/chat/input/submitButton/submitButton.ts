import {CompletionResult} from '../../../../types/openAIResult';
import {SVGIconUtil} from '../../../../utils/svgIconUtil';
import {AddNewMessage} from '../../messages/messages';
import {SUBMIT_ICON_STRING} from './submitIcon';
import {OpenAIClient} from './openAIClient';

export class SubmitButton {
  private _isLoading = false;
  private readonly _key: string;
  private readonly _addNewMessage: AddNewMessage;
  readonly elementRef: HTMLElement;
  private readonly _inputElementRef: HTMLElement;
  private readonly _buttonElementRef: HTMLElement;
  private readonly _loadingElementRef: HTMLElement;

  constructor(inputElementRef: HTMLElement, key: string, addNewMessage: AddNewMessage) {
    this.elementRef = document.createElement('div');
    this.elementRef.id = 'user-input';
    this._key = key;
    this._addNewMessage = addNewMessage;
    this._inputElementRef = inputElementRef;
    this.elementRef = this.createButtonElement();
    this._buttonElementRef = this.elementRef.children[0] as HTMLElement;
    this._loadingElementRef = SubmitButton.createLoadingElement();
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

  private static createLoadingElement() {
    const loadingElement = document.createElement('div');
    loadingElement.classList.add('dot-typing');
    return loadingElement;
  }

  public submit() {
    const inputText = this._inputElementRef.textContent?.trim();
    if (this._isLoading || !inputText || inputText === '') return;
    this.changeToLoadingIcon();
    this._addNewMessage(inputText as string, false);
    OpenAIClient.requestCompletion(this._key, inputText, this.onSuccessfulResult.bind(this));
    this._inputElementRef.textContent = '';
  }

  private onSuccessfulResult(result: CompletionResult) {
    this._addNewMessage(result.choices[0].text, true);
    this.changeToSubmitIcon();
  }

  private changeToLoadingIcon() {
    this.elementRef.replaceChild(this._loadingElementRef, this._buttonElementRef);
    this._isLoading = true;
  }

  private changeToSubmitIcon() {
    this.elementRef.replaceChild(this._buttonElementRef, this._loadingElementRef);
    this._isLoading = false;
  }
}
