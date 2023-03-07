import {OpenAIBaseBodyAssembler} from '../../../../client/openAI/assemblers/openAIBaseBodyAssembler';
import {OpenAIClientIOFactory} from '../../../../client/openAI/clientIO/openAIClientIOFactory';
import {OpenAIClientIO} from '../../../../client/openAI/clientIO/openAIClientIO';
import {OpenAIInternalBody} from '../../../../types/openAIInternal';
import {OpenAIClient} from '../../../../client/openAI/openAIClient';
import {RequestSettings} from '../../../../types/requestSettings';
import {SubmitButtonStyles} from '../../../../types/submitButton';
import {SUBMIT_ICON_STRING} from '../../../../icons/submitIcon';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {SVGIconUtil} from '../../../../utils/svg/svgIconUtil';
import {StatefulStyle} from '../../../../types/styles';
import {AiAssistant} from '../../../../aiAssistant';
import {Messages} from '../../messages/messages';

export interface MouseState {
  state: keyof StatefulStyle;
}

export class SubmitButton {
  private _isRequestInProgress = false; // used for stopping multiple Enter key submissions
  private _isLoadingActive = false;
  private _openAIBaseBody: OpenAIInternalBody;
  private _customRequestSettings?: RequestSettings;
  private _customStyles?: SubmitButtonStyles;
  private _clientIO: OpenAIClientIO;
  private readonly _key: string;
  private readonly _messages: Messages;
  readonly elementRef: HTMLElement;
  private readonly _inputElementRef: HTMLElement;
  private readonly _submitIconElementRef: SVGGraphicsElement;
  private readonly _stopIconElementRef: HTMLElement;
  private readonly _loadingIconElementRef: HTMLElement;
  private readonly _abortStream: AbortController;
  private readonly _mouseState: MouseState = {state: 'default'};

  constructor(inputElementRef: HTMLElement, messages: Messages, key: string, aiAssistant: AiAssistant) {
    const {openAI, requestSettings, submitButtonStyles} = aiAssistant;
    this._key = key;
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._customStyles = submitButtonStyles;
    this._submitIconElementRef = SubmitButton.createSubmitIconElement(this.submitFromInput.bind(this));
    this.elementRef = this.createButtonElement();
    this._stopIconElementRef = SubmitButton.createStopIconElement(this.stopStream.bind(this));
    this._loadingIconElementRef = SubmitButton.createLoadingIconElement();
    this._abortStream = new AbortController();
    this._openAIBaseBody = OpenAIBaseBodyAssembler.assemble(openAI);
    this._clientIO = OpenAIClientIOFactory.getClientIO(this._openAIBaseBody);
    this._customRequestSettings = requestSettings;
  }

  private createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'submit-button-container';
    buttonElement.appendChild(this._submitIconElementRef);
    if (this._customStyles) SubmitButtonStateStyle.reapply(buttonElement, this._customStyles, this._mouseState, 'submit');
    return buttonElement;
  }

  private static createSubmitIconElement(submitFromInput: () => void) {
    const svgIconElement = SVGIconUtil.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'submit-icon';
    svgIconElement.classList.add('clickable-icon');
    svgIconElement.onclick = submitFromInput.bind(this);
    return svgIconElement;
  }

  private static createLoadingIconElement() {
    const loadingIconElement = document.createElement('div');
    loadingIconElement.classList.add('dot-typing');
    return loadingIconElement;
  }

  private static createStopIconElement(stopStream: () => void) {
    const stopIconElement = document.createElement('div');
    stopIconElement.id = 'stop-icon';
    const stopIconContainerElement = document.createElement('div');
    stopIconContainerElement.classList.add('clickable-icon');
    stopIconContainerElement.appendChild(stopIconElement);
    stopIconContainerElement.onclick = stopStream;
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
    if (this._openAIBaseBody.stream) {
      OpenAIClient.requestStreamCompletion(this._clientIO, this._openAIBaseBody, this._key, this._customRequestSettings,
        this._messages, this.changeToStopIcon.bind(this), this.changeToSubmitIcon.bind(this), this._abortStream);
    } else {
      OpenAIClient.requestCompletion(this._clientIO, this._openAIBaseBody, this._key, this._customRequestSettings,
        this._messages, this.changeToSubmitIcon.bind(this));
    }
  }

  // This will not stop the stream on the server side
  private stopStream() {
    this._abortStream.abort();
    this.changeToSubmitIcon();
  }

  private changeToStopIcon() {
    this.elementRef.replaceChildren(this._stopIconElementRef);
    if (this._customStyles) {
      SubmitButtonStateStyle.reapply(this.elementRef, this._customStyles, this._mouseState, 'stop', ['loading', 'submit']);
    }
    this._isRequestInProgress = true;
  }

  private changeToLoadingIcon() {
    this.elementRef.replaceChildren(this._loadingIconElementRef);
    if (this._customStyles) {
      SubmitButtonStateStyle.reapply(this.elementRef, this._customStyles, this._mouseState, 'submit', ['loading']);
    }
    this._isRequestInProgress = true;
    this._isLoadingActive = true;
  }

  private changeToSubmitIcon() {
    this.elementRef.replaceChildren(this._submitIconElementRef);
    if (this._customStyles) {
      SubmitButtonStateStyle.resetSubmit(this.elementRef, this._customStyles, this._mouseState, this._isLoadingActive);
    }
    this._isRequestInProgress = false;
    this._isLoadingActive = false;
  }
}
