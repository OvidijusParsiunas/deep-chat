import {OpenAIClientIOFactory} from '../../../../client/openAI/clientIO/openAIClientIOFactory';
import {OpenAIParamAssembler} from '../../../../client/openAI/openAIParamAssembler';
import {OpenAIClientIO} from '../../../../client/openAI/clientIO/openAIClientIO';
import {OpenAIInternalParams} from '../../../../types/openAIInternal';
import {OpenAIClient} from '../../../../client/openAI/openAIClient';
import {SUBMIT_ICON_STRING} from '../../../../icons/submitIcon';
import {SVGIconUtil} from '../../../../utils/svg/svgIconUtil';
import {CustomStyle} from '../../../../types/styles';
import {Messages} from '../../messages/messages';
import {OpenAI} from '../../../../types/openAI';

export class SubmitButton {
  private _isRequestInProgress = false; // used for stopping multiple Enter key submissions
  private _openAIParams: OpenAIInternalParams;
  private _clientIO: OpenAIClientIO;
  private readonly _key: string;
  private readonly _messages: Messages;
  readonly elementRef: HTMLElement;
  private readonly _inputElementRef: HTMLElement;
  private readonly _submitIconElementRef: HTMLElement;
  private readonly _stopIconElementRef: HTMLElement;
  private readonly _loadingIconElementRef: HTMLElement;
  private readonly _abortStream: AbortController;

  constructor(inputElementRef: HTMLElement, messages: Messages, key: string, style?: CustomStyle, openAI?: OpenAI) {
    this._key = key;
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this.elementRef = this.createButtonElement();
    this._submitIconElementRef = this.elementRef.children[0] as HTMLElement;
    this._stopIconElementRef = this.createStopIconElement(style);
    this._loadingIconElementRef = SubmitButton.createLoadingIconElement();
    this._abortStream = new AbortController();
    this._openAIParams = OpenAIParamAssembler.assemble(openAI);
    this._clientIO = OpenAIClientIOFactory.getClientIO(this._openAIParams);
  }

  private createButtonElement() {
    const submitIconContainerElement = document.createElement('div');
    const svgIconElement = SVGIconUtil.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'submit-icon';
    submitIconContainerElement.appendChild(svgIconElement);
    submitIconContainerElement.classList.add('clickable-icon-container');
    submitIconContainerElement.onclick = this.submitFromInput.bind(this);
    const buttonElement = document.createElement('div');
    buttonElement.id = 'submit-button';
    buttonElement.appendChild(submitIconContainerElement);
    return buttonElement;
  }

  private static createLoadingIconElement() {
    const loadingIconElement = document.createElement('div');
    loadingIconElement.classList.add('dot-typing');
    return loadingIconElement;
  }

  private createStopIconElement(style?: CustomStyle) {
    const stopIconElement = document.createElement('div');
    stopIconElement.id = 'stop-icon';
    const stopIconContainerElement = document.createElement('div');
    stopIconContainerElement.classList.add('clickable-icon-container');
    stopIconContainerElement.appendChild(stopIconElement);
    stopIconContainerElement.onclick = this.stopStream.bind(this);
    Object.assign(stopIconContainerElement.style, style);
    return stopIconContainerElement;
  }

  public submitFromInput() {
    const inputText = this._inputElementRef.textContent?.trim() as string;
    this.submitUserText(inputText);
  }

  // prettier-ignore
  public submitUserText(userText: string) {
    if (this._isRequestInProgress || !userText || userText === '') return;
    this.changeToLoadingIcon();
    this._messages.addNewMessage(userText, false);
    this._inputElementRef.textContent = '';
    if (this._openAIParams.stream) {
      OpenAIClient.requestStreamCompletion(this._clientIO, this._openAIParams, this._key, this._messages,
        this.changeToStopIcon.bind(this), this.changeToSubmitIcon.bind(this), this._abortStream);
    } else {
      OpenAIClient.requestCompletion(this._clientIO, this._openAIParams, this._key, this._messages,
        this.changeToSubmitIcon.bind(this));
    }
  }

  private stopStream() {
    this._abortStream.abort();
    this.changeToSubmitIcon();
  }

  private changeToStopIcon() {
    this.elementRef.replaceChildren(this._stopIconElementRef);
    this._isRequestInProgress = true;
  }

  private changeToLoadingIcon() {
    this.elementRef.replaceChildren(this._loadingIconElementRef);
    this._isRequestInProgress = true;
  }

  private changeToSubmitIcon() {
    this.elementRef.replaceChildren(this._submitIconElementRef);
    this._isRequestInProgress = false;
  }
}
