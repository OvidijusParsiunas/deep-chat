import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {OpenAIBaseBodyGenerator} from '../../../../../client/openAI/body/openAIBaseBodyGenerator';
import {OpenAIClientIOFactory} from '../../../../../client/openAI/clientIO/openAIClientIOFactory';
import {OpenAIClientIO} from '../../../../../client/openAI/clientIO/openAIClientIO';
import {RequestInterceptor} from '../../../../../types/requestInterceptor';
import {OpenAIInternalBody} from '../../../../../types/openAIInternal';
import {OpenAIClient} from '../../../../../client/openAI/openAIClient';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {RequestSettings} from '../../../../../types/requestSettings';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {AiAssistant} from '../../../../../aiAssistant';
import {ButtonStyleEvents} from '../buttonStyleEvents';
import {Messages} from '../../../messages/messages';

type Styles = DefinedButtonStateStyles<SubmitButtonStyles>;

export class SubmitButton extends ButtonStyleEvents<Styles> {
  private _isRequestInProgress = false; // used for stopping multiple Enter key submissions
  private _isLoadingActive = false;
  private readonly _openAIBaseBody: OpenAIInternalBody;
  private readonly _customRequestSettings?: RequestSettings;
  private readonly _requestInterceptor: RequestInterceptor;
  private readonly _clientIO: OpenAIClientIO;
  private readonly _key: string;
  private readonly _messages: Messages;
  private readonly _inputElementRef: HTMLElement;
  private readonly _abortStream: AbortController;
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private _isSVGLoadingOverriden = false;

  constructor(inputElementRef: HTMLElement, messages: Messages, key: string, aiAssistant: AiAssistant) {
    const {openAI, context, requestSettings, submitButtonStyles, requestInterceptor, inputCharacterLimit} = aiAssistant;
    super(SubmitButton.createButtonContainerElement(), submitButtonStyles);
    this._key = key;
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._innerElements = this.createInnerElements();
    this._abortStream = new AbortController();
    this._openAIBaseBody = OpenAIBaseBodyGenerator.generate(openAI, context);
    this._clientIO = OpenAIClientIOFactory.getClientIO(this._openAIBaseBody, inputCharacterLimit);
    this._customRequestSettings = requestSettings;
    if (!this._customStyles?.loading) this.overwriteLoadingStyleIfNoLoadingMessage(aiAssistant);
    this.changeToSubmitIcon();
    this._requestInterceptor = requestInterceptor || ((body) => body);
  }

  // prettier-ignore
  private createInnerElements() {
    const {submit, loading, stop} = CustomButtonInnerElements.create<Styles>(
      ['submit', 'loading', 'stop'], 'submit-icon', this._customStyles);
    return {
      submit: submit || SubmitButton.createSubmitIconElement(),
      loading: loading || SubmitButton.createLoadingIconElement(),
      stop: stop || SubmitButton.createStopIconElement(),
    };
  }

  private static createButtonContainerElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSubmitIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'submit-icon';
    return svgIconElement;
  }

  private static createLoadingIconElement() {
    const loadingIconElement = document.createElement('div');
    loadingIconElement.classList.add('dots-jumping');
    return loadingIconElement;
  }

  private static createStopIconElement() {
    const stopIconElement = document.createElement('div');
    stopIconElement.id = 'stop-icon';
    return stopIconElement;
  }

  private overwriteLoadingStyleIfNoLoadingMessage(aiAssistant: AiAssistant) {
    if (aiAssistant.displayLoadingMessage === undefined || aiAssistant.displayLoadingMessage === true) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .loading-button > * {
          filter: brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%)
            contrast(96%) !important;
        }`;
      aiAssistant.shadowRoot?.appendChild(styleElement);
      this._isSVGLoadingOverriden = true;
    }
  }

  public submitFromInput() {
    const inputText = this._inputElementRef.textContent?.trim() as string;
    this.submitUserText(inputText);
  }

  // prettier-ignore
  public submitUserText(userText: string) {
    if (this._isRequestInProgress || !userText || userText === '') return;
    this.changeToLoadingIcon();
    this._messages.addNewMessage(userText, false, true);
    this._messages.addLoadingMessage();
    this._inputElementRef.textContent = '';
    if (this._openAIBaseBody.stream) {
      OpenAIClient.requestStreamCompletion(this._clientIO, this._openAIBaseBody, this._key, this._customRequestSettings,
        this._messages, this._requestInterceptor, this.changeToStopIcon.bind(this),
        this.changeToSubmitIcon.bind(this), this._abortStream);
    } else {
      OpenAIClient.requestCompletion(this._clientIO, this._openAIBaseBody, this._key, this._customRequestSettings,
        this._messages, this._requestInterceptor, this.changeToSubmitIcon.bind(this));
    }
  }

  // This will not stop the stream on the server side
  private stopStream() {
    this._abortStream.abort();
    this.changeToSubmitIcon();
  }

  private changeToStopIcon() {
    this.elementRef.classList.remove('loading-button');
    this.elementRef.replaceChildren(this._innerElements.stop);
    this.reapplyStateStyle('stop', ['loading', 'submit']);
    this.elementRef.onclick = this.stopStream.bind(this);
    this._isLoadingActive = false;
  }

  private changeToLoadingIcon() {
    if (!this._isSVGLoadingOverriden) this.elementRef.replaceChildren(this._innerElements.loading);
    this.elementRef.classList.add('loading-button');
    this.reapplyStateStyle('loading', ['submit']);
    this.elementRef.onclick = () => {};
    this._isRequestInProgress = true;
    this._isLoadingActive = true;
  }

  private changeToSubmitIcon() {
    this.elementRef.classList.remove('loading-button');
    this.elementRef.replaceChildren(this._innerElements.submit);
    SubmitButtonStateStyle.resetSubmit(this, this._isLoadingActive);
    this.elementRef.onclick = this.submitFromInput.bind(this);
    this._isRequestInProgress = false;
    this._isLoadingActive = false;
  }
}
