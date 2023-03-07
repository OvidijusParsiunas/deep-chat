import {OpenAIBaseBodyAssembler} from '../../../../client/openAI/assemblers/openAIBaseBodyAssembler';
import {OpenAIClientIOFactory} from '../../../../client/openAI/clientIO/openAIClientIOFactory';
import {SubmitButtonInnerElements} from '../../../../types/submitButtonInternal';
import {OpenAIClientIO} from '../../../../client/openAI/clientIO/openAIClientIO';
import {OpenAIInternalBody} from '../../../../types/openAIInternal';
import {OpenAIClient} from '../../../../client/openAI/openAIClient';
import {SubmitButtonStyles} from '../../../../types/submitButton';
import {RequestSettings} from '../../../../types/requestSettings';
import {SUBMIT_ICON_STRING} from '../../../../icons/submitIcon';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {SVGIconUtil} from '../../../../utils/svg/svgIconUtil';
import {CustomInnerElements} from './customInnerElements';
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
  readonly elementRef: HTMLElement;
  private readonly _key: string;
  private readonly _messages: Messages;
  private readonly _inputElementRef: HTMLElement;
  private readonly _abortStream: AbortController;
  private readonly _mouseState: MouseState = {state: 'default'};
  private readonly _innerElements: SubmitButtonInnerElements;

  constructor(inputElementRef: HTMLElement, messages: Messages, key: string, aiAssistant: AiAssistant) {
    const {openAI, requestSettings, submitButtonStyles} = aiAssistant;
    this._key = key;
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._customStyles = submitButtonStyles;
    this._innerElements = this.createInnerElements();
    this.elementRef = this.createButtonContainerElement();
    this._abortStream = new AbortController();
    this._openAIBaseBody = OpenAIBaseBodyAssembler.assemble(openAI);
    this._clientIO = OpenAIClientIOFactory.getClientIO(this._openAIBaseBody);
    this._customRequestSettings = requestSettings;
    this.changeToSubmitIcon();
  }

  private createInnerElements() {
    const {submit, loading, stop} = CustomInnerElements.create(this._customStyles);
    return {
      submit: submit || SubmitButton.createSubmitIconElement(),
      loading: loading || SubmitButton.createLoadingIconElement(),
      stop: stop || SubmitButton.createStopIconElement(),
    };
  }

  private createButtonContainerElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'submit-button-container';
    return buttonElement;
  }

  private static createSubmitIconElement() {
    const svgIconElement = SVGIconUtil.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'submit-icon';
    svgIconElement.classList.add('clickable-icon');
    return svgIconElement;
  }

  private static createLoadingIconElement() {
    const loadingIconElement = document.createElement('div');
    loadingIconElement.classList.add('dots-loading');
    return loadingIconElement;
  }

  private static createStopIconElement() {
    const stopIconElement = document.createElement('div');
    stopIconElement.id = 'stop-icon';
    stopIconElement.classList.add('clickable-icon');
    return stopIconElement;
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
    this.elementRef.replaceChildren(this._innerElements.stop);
    if (this._customStyles) {
      SubmitButtonStateStyle.reapply(this.elementRef, this._customStyles, this._mouseState, 'stop', ['loading', 'submit']);
    }
    this.elementRef.onclick = this.stopStream.bind(this);
    this._isLoadingActive = false;
  }

  private changeToLoadingIcon() {
    this.elementRef.replaceChildren(this._innerElements.loading);
    if (this._customStyles) {
      SubmitButtonStateStyle.reapply(this.elementRef, this._customStyles, this._mouseState, 'loading', ['submit']);
    }
    this.elementRef.onclick = () => {};
    this._isRequestInProgress = true;
    this._isLoadingActive = true;
  }

  private changeToSubmitIcon() {
    this.elementRef.replaceChildren(this._innerElements.submit);
    if (this._customStyles) {
      SubmitButtonStateStyle.resetSubmit(this.elementRef, this._customStyles, this._mouseState, this._isLoadingActive);
    }
    this.elementRef.onclick = this.submitFromInput.bind(this);
    this._isRequestInProgress = false;
    this._isLoadingActive = false;
  }
}
