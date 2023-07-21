import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {ServiceIO} from '../../../../../services/serviceIO';
import {TextInputEl} from '../../textInput/textInput';
import {Messages} from '../../../messages/messages';
import {DeepChat} from '../../../../../deepChat';
import {InputButton} from '../inputButton';

type Styles = DefinedButtonStateStyles<SubmitButtonStyles>;

export class SubmitButton extends InputButton<Styles> {
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
  constructor(deepChat: DeepChat, inputElementRef: HTMLElement, messages: Messages, serviceIO: ServiceIO,
      fileAttachments: FileAttachments) {
    super(SubmitButton.createButtonContainerElement(), deepChat.submitButtonStyles?.position, deepChat.submitButtonStyles);
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._fileAttachments = fileAttachments;
    this._innerElements = this.createInnerElements();
    this._abortStream = new AbortController();
    this._serviceIO = serviceIO;
    this.attemptOverwriteLoadingStyle(deepChat);
    this.changeToSubmitIcon();
  }

  // prettier-ignore
  private createInnerElements() {
    const {submit, loading, stop} = CustomButtonInnerElements.create<Styles>(
      this.elementRef, ['submit', 'loading', 'stop'], this._customStyles);
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

  // prettier-ignore
  private attemptOverwriteLoadingStyle(deepChat: DeepChat) {
    if (this._customStyles?.submit?.svg
        || this._customStyles?.loading?.svg?.content || this._customStyles?.loading?.text?.content) return;
    if (deepChat.displayLoadingBubble === undefined || deepChat.displayLoadingBubble === true) {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .loading-button > * {
          filter: brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%)
            contrast(96%) !important;
        }`;
      deepChat.shadowRoot?.appendChild(styleElement);
      this._isSVGLoadingIconOverriden = true;
    }
  }

  public submitFromInput() {
    if (this._inputElementRef.classList.contains('text-input-placeholder')) {
      this.submit(false, '');
    } else {
      const inputText = this._inputElementRef.textContent?.trim() as string;
      this.submit(false, inputText);
    }
  }

  // TO-DO - button should be disabled if validateMessageBeforeSending is not valid
  public async submit(programmatic: boolean, userText: string) {
    let uploadedFilesData;
    let fileData;
    if (!programmatic) {
      await this._fileAttachments.completePlaceholders();
      uploadedFilesData = this._fileAttachments.getAllFileData();
      fileData = uploadedFilesData?.map((fileData) => fileData.file);
    }
    const submittedText = userText === '' ? undefined : userText;
    if (this._isRequestInProgress) return;
    if (this._serviceIO.deepChat?.validateMessageBeforeSending) {
      if (!this._serviceIO.deepChat.validateMessageBeforeSending(submittedText, fileData)) return;
    } else if (!this._serviceIO.canSendMessage(submittedText, fileData)) return;
    this.changeToLoadingIcon();
    if (userText !== '') this._messages.addNewMessage({text: userText}, false, true);
    if (uploadedFilesData) await this._messages.addMultipleFiles(uploadedFilesData);
    this._messages.addLoadingMessage();
    if (!programmatic) TextInputEl.clear(this._inputElementRef);
    const completionsHandlers = {
      onFinish: this.changeToSubmitIcon.bind(this),
    };
    const streamHandlers = {
      onOpen: this.changeToStopIcon.bind(this),
      onClose: this.changeToSubmitIcon.bind(this),
      abortStream: this._abortStream,
    };
    const requestContents = {text: submittedText, files: fileData};
    this._serviceIO.callAPI(requestContents, this._messages, completionsHandlers, streamHandlers);
    if (!programmatic) this._fileAttachments?.removeAllFiles();
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
