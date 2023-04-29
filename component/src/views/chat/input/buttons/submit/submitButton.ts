import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {ServiceIO} from '../../../../../services/serviceIO';
import {AiAssistant} from '../../../../../aiAssistant';
import {ButtonStyleEvents} from '../buttonStyleEvents';
import {Messages} from '../../../messages/messages';

type Styles = DefinedButtonStateStyles<SubmitButtonStyles>;

export class SubmitButton extends ButtonStyleEvents<Styles> {
  private _isRequestInProgress = false; // used for stopping multiple Enter key submissions
  private _isLoadingActive = false;
  private readonly _serviceIO: ServiceIO;
  private readonly _messages: Messages;
  private readonly _inputElementRef: HTMLElement;
  private readonly _abortStream: AbortController;
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachments: FileAttachments;
  private _isSVGLoadingIconOverriden = false;

  // prettier-ignore
  constructor(aiAssistant: AiAssistant, inputElementRef: HTMLElement, messages: Messages, serviceIO: ServiceIO,
      fileAttachments: FileAttachments) {
    const {submitButtonStyles} = aiAssistant;
    super(SubmitButton.createButtonContainerElement(), submitButtonStyles);
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._fileAttachments = fileAttachments;
    this._innerElements = this.createInnerElements();
    this._abortStream = new AbortController();
    this._serviceIO = serviceIO;
    if (!this._customStyles?.loading) this.overwriteLoadingStyleIfNoLoadingMessage(aiAssistant);
    this.changeToSubmitIcon();
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
      this._isSVGLoadingIconOverriden = true;
    }
  }

  public submitFromInput() {
    if (this._inputElementRef.classList.contains('keyboard-input-placeholder')) {
      this.submit('');
    } else {
      const inputText = this._inputElementRef.textContent?.trim() as string;
      this.submit(inputText);
    }
  }

  public async submit(userText: string) {
    const uploadedFilesData = this._fileAttachments.getAllFileData();
    const fileData = uploadedFilesData?.map((fileData) => fileData.file);
    if (this._isRequestInProgress || !this._serviceIO.canSendMessage(userText, fileData)) return;
    this.changeToLoadingIcon();
    if (userText !== '') this._messages.addNewMessage({text: userText}, false, true);
    if (uploadedFilesData) await this._messages.addMultipleFiles(uploadedFilesData);
    this._messages.addLoadingMessage();
    this._inputElementRef.textContent = '';
    const completionsHandlers = {
      onFinish: this.changeToSubmitIcon.bind(this),
    };
    const streamHandlers = {
      onOpen: this.changeToStopIcon.bind(this),
      onClose: this.changeToSubmitIcon.bind(this),
      abortStream: this._abortStream,
    };
    this._serviceIO.callApi(this._messages, completionsHandlers, streamHandlers, fileData);
    this._fileAttachments?.removeAllFiles();
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
    if (!this._isSVGLoadingIconOverriden) this.elementRef.replaceChildren(this._innerElements.loading);
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
