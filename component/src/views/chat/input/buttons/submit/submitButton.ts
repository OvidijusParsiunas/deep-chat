import {ValidationHandler} from '../../../../../types/validationHandler';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {MessageFileType} from '../../../../../types/messageFile';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {ServiceIO} from '../../../../../services/serviceIO';
import {Response} from '../../../../../types/response';
import {TextInputEl} from '../../textInput/textInput';
import {Signals} from '../../../../../types/handler';
import {Messages} from '../../../messages/messages';
import {DeepChat} from '../../../../../deepChat';
import {InputButton} from '../inputButton';
import {
  DefinedButtonInnerElements,
  DefinedButtonStateStyles,
  ButtonInnerElement,
} from '../../../../../types/buttonInternal';

type Styles = Omit<DefinedButtonStateStyles<SubmitButtonStyles>, 'alwaysEnabled'>;

export class SubmitButton extends InputButton<Styles> {
  private _isRequestInProgress = false; // used for stopping multiple Enter key submissions
  private _isLoadingActive = false;
  private readonly _serviceIO: ServiceIO;
  private readonly _messages: Messages;
  private readonly _inputElementRef: HTMLElement;
  private readonly _abortStream: AbortController;
  private readonly _stopClicked: Signals['stopClicked'];
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachments: FileAttachments;
  private readonly _alwaysEnabled: boolean;
  private _isSVGLoadingIconOverriden = false;
  private _validationHandler?: ValidationHandler;

  // prettier-ignore
  constructor(deepChat: DeepChat, inputElementRef: HTMLElement, messages: Messages, serviceIO: ServiceIO,
      fileAttachments: FileAttachments) {
    SubmitButtonStateStyle.prepare(deepChat);
    super(SubmitButton.createButtonContainerElement(), deepChat.submitButtonStyles?.position, deepChat.submitButtonStyles);
    this._messages = messages;
    this._inputElementRef = inputElementRef;
    this._fileAttachments = fileAttachments;
    this._innerElements = this.createInnerElements();
    this._abortStream = new AbortController();
    this._stopClicked = {listener: () => {}};
    this._serviceIO = serviceIO;
    this._alwaysEnabled = !!deepChat.submitButtonStyles?.alwaysEnabled;
    deepChat.changeSubmitButtonState = this.changeSubmitButtonState.bind(this, serviceIO);
    this.attemptOverwriteLoadingStyle(deepChat);
    setTimeout(() => { // in a timeout as deepChat._validationHandler initialised later
      this._validationHandler = deepChat._validationHandler;
      this.assignHandlers(this._validationHandler as ValidationHandler);
      this._validationHandler?.();
    });
  }

  // prettier-ignore
  private createInnerElements() {
    const {submit, loading, stop} = CustomButtonInnerElements.create<Styles>(
      this.elementRef, ['submit', 'loading', 'stop'], this._customStyles);
    const submitElement = submit || SubmitButton.createSubmitIconElement();
    return {
      submit: submitElement,
      loading: loading || SubmitButton.createLoadingIconElement(),
      stop: stop || SubmitButton.createStopIconElement(),
      disabled: this.createDisabledIconElement(submitElement),
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

  private createDisabledIconElement(submitElement: ButtonInnerElement) {
    const element = CustomButtonInnerElements.createCustomElement('disabled', this._customStyles);
    return element || (submitElement.cloneNode(true) as ButtonInnerElement);
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

  private assignHandlers(validationHandler: ValidationHandler) {
    this._serviceIO.completionsHandlers = {
      onFinish: validationHandler.bind(this),
    };
    this._serviceIO.streamHandlers = {
      onOpen: this.changeToStopIcon.bind(this),
      onClose: validationHandler.bind(this),
      abortStream: this._abortStream,
      stopClicked: this._stopClicked,
    };
    const {stream} = this._serviceIO.deepChat;
    if (typeof stream === 'object' && typeof stream.simulation === 'number') {
      this._serviceIO.streamHandlers.simulationInterim = stream.simulation;
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

  // TO-DO - should be disabled loading history
  // prettier-ignore
  public async submit(isProgrammatic: boolean, userText: string) {
    let uploadedFilesData;
    let fileData;
    if (!isProgrammatic) {
      await this._fileAttachments.completePlaceholders();
      uploadedFilesData = this._fileAttachments.getAllFileData();
      fileData = uploadedFilesData?.map((fileData) => fileData.file);
    }
    if (this._isRequestInProgress || await this._validationHandler?.(isProgrammatic) === false) return;
    this.changeToLoadingIcon();
    await this.addNewMessages(userText, uploadedFilesData);
    this._messages.addLoadingMessage();
    if (!isProgrammatic) TextInputEl.clear(this._inputElementRef); // when uploading a file and placeholder text present

    const requestContents = {text: userText === '' ? undefined : userText, files: fileData};
    await this._serviceIO.callAPI(requestContents, this._messages);
    if (!isProgrammatic) this._fileAttachments?.removeAllFiles();
  }

  private async addNewMessages(userText: string, uploadedFilesData?: {file: File; type: MessageFileType}[]) {
    const data: Response = {};
    if (userText !== '') data.text = userText;
    if (uploadedFilesData) data.files = await this._messages.addMultipleFiles(uploadedFilesData);
    if (Object.keys(data).length > 0) this._messages.addNewMessage(data, false);
  }

  private stopStream() {
    // This will not stop the stream on the server side
    this._abortStream.abort();
    this._stopClicked?.listener();
  }

  private changeToStopIcon() {
    this.elementRef.classList.remove('loading-button');
    this.elementRef.replaceChildren(this._innerElements.stop);
    this.reapplyStateStyle('stop', ['loading', 'submit']);
    this.elementRef.onclick = this.stopStream.bind(this);
    this._isLoadingActive = false;
  }

  // WORK - animation needs to be lowered
  private changeToLoadingIcon() {
    if (this._serviceIO.websocket) return;
    if (!this._isSVGLoadingIconOverriden) this.elementRef.replaceChildren(this._innerElements.loading);
    this.elementRef.classList.add('loading-button');
    this.reapplyStateStyle('loading', ['submit']);
    this.elementRef.onclick = () => {};
    this._isRequestInProgress = true;
    this._isLoadingActive = true;
  }

  public changeToSubmitIcon() {
    this.elementRef.classList.remove('loading-button');
    this.elementRef.replaceChildren(this._innerElements.submit);
    SubmitButtonStateStyle.resetSubmit(this, this._isLoadingActive);
    this.elementRef.onclick = this.submitFromInput.bind(this);
    this._isRequestInProgress = false;
    this._isLoadingActive = false;
  }

  public changeToDisabledIcon(isProgrammatic = false) {
    const isAllowed = isProgrammatic ? true : !this._alwaysEnabled;
    if (this._isRequestInProgress || this._isLoadingActive || !isAllowed) this.changeToSubmitIcon();
    if (isAllowed) {
      this.elementRef.replaceChildren(this._innerElements.disabled);
      this.reapplyStateStyle('disabled', ['submit']);
      this.elementRef.onclick = () => {};
    }
  }

  private changeSubmitButtonState(serviceIO: ServiceIO, isEnabled: boolean) {
    serviceIO.isSubmitProgrammaticallyDisabled = !isEnabled;
    if (isEnabled) {
      this.changeToSubmitIcon();
    } else {
      this.changeToDisabledIcon(true);
    }
  }
}
