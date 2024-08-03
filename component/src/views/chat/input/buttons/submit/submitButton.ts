import {FileAttachmentsType} from '../../fileAttachments/fileAttachmentTypes/fileAttachmentsType';
import {ValidationHandler} from '../../../../../types/validationHandler';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {FileAttachments} from '../../fileAttachments/fileAttachments';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SpeechToText} from '../microphone/speechToText/speechToText';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {UserContentI} from '../../../../../types/messagesInternal';
import {SubmitButtonStateStyle} from './submitButtonStateStyle';
import {MicrophoneButton} from '../microphone/microphoneButton';
import {ServiceIO} from '../../../../../services/serviceIO';
import {MessageUtils} from '../../../messages/messageUtils';
import {UserContent} from '../../../../../types/messages';
import {Legacy} from '../../../../../utils/legacy/legacy';
import {Response} from '../../../../../types/response';
import {TextInputEl} from '../../textInput/textInput';
import {Signals} from '../../../../../types/handler';
import {Messages} from '../../../messages/messages';
import {DeepChat} from '../../../../../deepChat';
import {InputButton} from '../inputButton';
import {Buttons} from '../../input';
import {
  DefinedButtonInnerElements,
  DefinedButtonStateStyles,
  ButtonInnerElement,
} from '../../../../../types/buttonInternal';

type Styles = Omit<DefinedButtonStateStyles<SubmitButtonStyles>, 'alwaysEnabled'>;

export class SubmitButton extends InputButton<Styles> {
  private static readonly SUBMIT_CLASS = 'submit-button';
  private static readonly LOADING_CLASS = 'loading-button';
  private static readonly DISABLED_CLASS = 'disabled-button';
  private readonly _serviceIO: ServiceIO;
  private readonly _messages: Messages;
  private readonly _textInput: TextInputEl;
  private readonly _abortStream: AbortController;
  private readonly _stopClicked: Signals['stopClicked'];
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private readonly _fileAttachments: FileAttachments;
  private readonly _alwaysEnabled: boolean;
  private _microphoneButton?: MicrophoneButton;
  private _stopSTTAfterSubmit?: boolean;
  private _isSVGLoadingIconOverriden = false;
  private _validationHandler?: ValidationHandler;
  readonly status = {requestInProgress: false, loadingActive: false};

  // prettier-ignore
  constructor(deepChat: DeepChat, textInput: TextInputEl, messages: Messages, serviceIO: ServiceIO,
      fileAttachments: FileAttachments, buttons: Buttons) {
    const submitButtonStyles = SubmitButtonStateStyle.process(deepChat.submitButtonStyles);
    super(SubmitButton.createButtonContainerElement(), submitButtonStyles?.position, submitButtonStyles);
    this._messages = messages;
    this._textInput = textInput;
    this._fileAttachments = fileAttachments;
    this._innerElements = this.createInnerElements();
    this._abortStream = new AbortController();
    this._stopClicked = {listener: () => {}};
    this._serviceIO = serviceIO;
    this._alwaysEnabled = !!submitButtonStyles?.alwaysEnabled;
    deepChat.disableSubmitButton = this.disableSubmitButton.bind(this, serviceIO);
    this.attemptOverwriteLoadingStyle(deepChat);
    if (buttons.microphone) this.setUpSpeechToText(buttons.microphone.button, deepChat.speechToText);
    setTimeout(() => { // in a timeout as deepChat._validationHandler initialised later
      this._validationHandler = deepChat._validationHandler;
      this.assignHandlers(this._validationHandler as ValidationHandler);
      this._validationHandler?.();
    });
  }

  private createInnerElements() {
    const {submit, loading, stop} = this.createCustomElements();
    const submitElement = submit || SubmitButton.createSubmitIconElement();
    return {
      submit: submitElement,
      loading: loading || SubmitButton.createLoadingIconElement(),
      stop: stop || SubmitButton.createStopIconElement(),
      disabled: this.createDisabledIconElement(submitElement),
    };
  }

  private createCustomElements() {
    const submit = CustomButtonInnerElements.createSpecificStateElement(this.elementRef, 'submit', this._customStyles);
    const states: {[key in keyof Styles]: ButtonInnerElement} = {loading: undefined, stop: undefined};
    Object.keys(states).forEach((state) => {
      const styleState = state as keyof Styles;
      const element = CustomButtonInnerElements.createCustomElement(styleState, this._customStyles);
      if (element) states[styleState] = element;
    });
    states.submit = submit;
    return states;
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
    loadingIconElement.classList.add('loading-submit-button');
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
      onFinish: this.resetSubmit.bind(this, validationHandler),
    };
    this._serviceIO.streamHandlers = {
      onOpen: this.changeToStopIcon.bind(this),
      onClose: this.resetSubmit.bind(this, validationHandler),
      abortStream: this._abortStream,
      stopClicked: this._stopClicked,
    };
    const {stream} = this._serviceIO;
    if (typeof stream === 'object' && typeof stream.simulation === 'number') {
      this._serviceIO.streamHandlers.simulationInterim = stream.simulation;
    }
  }

  private setUpSpeechToText(microphoneButton: InputButton, speechToText: DeepChat['speechToText']) {
    this._microphoneButton = microphoneButton as MicrophoneButton;
    this._stopSTTAfterSubmit = typeof speechToText === 'object' ? speechToText.stopAfterSubmit : false;
  }

  private resetSubmit(validationHandler: ValidationHandler) {
    this.status.requestInProgress = false;
    this.status.loadingActive = false;
    validationHandler();
  }

  public async submitFromInput() {
    await this._fileAttachments.completePlaceholders();
    const uploadedFilesData = this._fileAttachments.getAllFileData();
    if (this._textInput.isTextInputEmpty()) {
      this.attemptSubmit({text: '', files: uploadedFilesData});
    } else {
      // not using textContent as it ignores new line spaces
      const inputText = this._textInput.inputElementRef.innerText.trim() as string;
      this.attemptSubmit({text: inputText, files: uploadedFilesData});
    }
  }

  public async programmaticSubmit(content: UserContent) {
    if (typeof content === 'string') content = Legacy.processSubmitUserMessage(content);
    const newContent: UserContentI = {text: content.text};
    if (content.files) {
      newContent.files = Array.from(content.files).map((file) => {
        return {file, type: FileAttachmentsType.getTypeFromBlob(file)};
      });
    }
    // in timeout to prevent adding multiple messages before validation+file addition finishes
    setTimeout(() => this.attemptSubmit(newContent, true));
  }

  // TO-DO - should be disabled when loading history
  public async attemptSubmit(content: UserContentI, isProgrammatic = false) {
    if ((await this._validationHandler?.(isProgrammatic ? content : undefined)) === false) return;
    this.changeToLoadingIcon();
    await this.addNewMessage(content);
    if (!this._serviceIO.isWebModel()) this._messages.addLoadingMessage();
    this._textInput.clear();
    const filesData = content.files?.map((fileData) => fileData.file);
    const requestContents = {text: content.text === '' ? undefined : content.text, files: filesData};
    await this._serviceIO.callAPI(requestContents, this._messages);
    this._fileAttachments?.removeAllFiles();
  }

  private async addNewMessage({text, files}: UserContentI) {
    const data: Response = {role: MessageUtils.USER_ROLE};
    if (text) data.text = text;
    if (files) data.files = await this._messages.addMultipleFiles(files);
    if (this._serviceIO.sessionId) data._sessionId = this._serviceIO.sessionId;
    if (Object.keys(data).length > 0) this._messages.addNewMessage(data);
  }

  private stopStream() {
    // This will not stop the stream on the server side
    this._abortStream.abort();
    this._stopClicked?.listener();
    if (this._validationHandler) this.resetSubmit(this._validationHandler);
  }

  private changeToStopIcon() {
    if (this._serviceIO.websocket) return; // stop not used for streaming messages in websocket
    this.elementRef.classList.remove(SubmitButton.LOADING_CLASS, SubmitButton.DISABLED_CLASS, SubmitButton.SUBMIT_CLASS);
    this.elementRef.replaceChildren(this._innerElements.stop);
    this.reapplyStateStyle('stop', ['loading', 'submit']);
    this.elementRef.onclick = this.stopStream.bind(this);
    this.status.loadingActive = false;
  }

  private changeToLoadingIcon() {
    if (this._serviceIO.websocket) return;
    if (!this._isSVGLoadingIconOverriden) this.elementRef.replaceChildren(this._innerElements.loading);
    this.elementRef.classList.remove(SubmitButton.SUBMIT_CLASS, SubmitButton.DISABLED_CLASS);
    this.elementRef.classList.add(SubmitButton.LOADING_CLASS);
    this.reapplyStateStyle('loading', ['submit']);
    this.elementRef.onclick = () => {};
    this.status.requestInProgress = true;
    this.status.loadingActive = true;
  }

  // called every time when user triggers an input via ValidationHandler - hence use class to check if not already present
  public changeToSubmitIcon() {
    if (this.elementRef.classList.contains(SubmitButton.SUBMIT_CLASS)) return;
    this.elementRef.classList.remove(SubmitButton.LOADING_CLASS, SubmitButton.DISABLED_CLASS);
    this.elementRef.classList.add(SubmitButton.SUBMIT_CLASS);
    this.elementRef.replaceChildren(this._innerElements.submit);
    SubmitButtonStateStyle.resetSubmit(this, this.status.loadingActive);
    this.elementRef.onclick = () => {
      this.submitFromInput();
      if (this._microphoneButton?.isActive) {
        SpeechToText.toggleSpeechAfterSubmit(this._microphoneButton.elementRef, !!this._stopSTTAfterSubmit);
      }
    };
  }

  // called every time when user triggers an input via ValidationHandler - hence use class to check if not already present
  public changeToDisabledIcon(isProgrammatic = false) {
    if (this._alwaysEnabled && !isProgrammatic) {
      this.changeToSubmitIcon();
    } else if (!this.elementRef.classList.contains(SubmitButton.DISABLED_CLASS)) {
      this.elementRef.classList.remove(SubmitButton.LOADING_CLASS, SubmitButton.SUBMIT_CLASS);
      this.elementRef.classList.add(SubmitButton.DISABLED_CLASS);
      this.elementRef.replaceChildren(this._innerElements.disabled);
      this.reapplyStateStyle('disabled', ['submit']);
      this.elementRef.onclick = () => {};
    }
  }

  private disableSubmitButton(serviceIO: ServiceIO, isDisabled?: boolean) {
    serviceIO.isSubmitProgrammaticallyDisabled = isDisabled !== false;
    if (this.status.requestInProgress || this.status.loadingActive) return;
    if (isDisabled === false) {
      this._validationHandler?.();
    } else {
      this.changeToDisabledIcon(true);
    }
  }
}
