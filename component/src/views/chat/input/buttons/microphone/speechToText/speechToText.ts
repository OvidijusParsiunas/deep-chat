import {ValidationHandler} from '../../../../../../types/validationHandler';
import {SpeechToTextConfig} from '../../../../../../types/microphone';
import {OnPreResult} from 'speech-to-element/dist/types/options';
import {TextInputEl} from '../../../textInput/textInput';
import {Messages} from '../../../../messages/messages';
import {MicrophoneButton} from '../microphoneButton';
import {DeepChat} from '../../../../../../deepChat';
import SpeechToElement from 'speech-to-element';
import {SilenceSubmit} from './silenceSubmit';

export type ProcessedConfig = SpeechToTextConfig & {onPreResult?: OnPreResult};

export type AddErrorMessage = Messages['addNewErrorMessage'];

export class SpeechToText extends MicrophoneButton {
  private readonly _addErrorMessage: AddErrorMessage;
  private _silenceSubmit?: SilenceSubmit;
  private _validationHandler?: ValidationHandler;
  public static readonly MICROPHONE_RESET_TIMEOUT_MS = 300;

  constructor(deepChat: DeepChat, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    const config = typeof deepChat.speechToText === 'object' ? deepChat.speechToText : {};
    super(config?.button);
    const {serviceName, processedConfig} = this.processConfiguration(textInput, deepChat.speechToText);
    this._addErrorMessage = addErrorMessage;
    if (serviceName === 'webspeech' && !SpeechToElement.isWebSpeechSupported()) {
      this.changeToUnsupported();
    } else {
      const isInputEnabled = !deepChat.textInput || !deepChat.textInput.disabled;
      this.elementRef.onclick = this.buttonClick.bind(this, textInput, isInputEnabled, serviceName, processedConfig);
    }
    setTimeout(() => {
      this._validationHandler = deepChat._validationHandler;
    });
  }

  // prettier-ignore
  private processConfiguration(textInput: TextInputEl, config?: boolean | SpeechToTextConfig):
      {serviceName: string, processedConfig: ProcessedConfig} {
    const newConfig = typeof config === 'object' ? config : {};
    const webSpeechConfig = typeof newConfig.webSpeech === 'object' ? newConfig.webSpeech : {};
    const azureConfig = newConfig.azure || {};
    const processedConfig: ProcessedConfig = {
      displayInterimResults: newConfig.displayInterimResults ?? undefined,
      textColor: newConfig.textColor ?? undefined,
      translations: newConfig.translations ?? undefined,
      commands: newConfig.commands ?? undefined,
      events: newConfig.events ?? undefined,
      ...webSpeechConfig,
      ...azureConfig,
    };
    const submitPhrase = newConfig.commands?.submit;
    if (submitPhrase) {
      processedConfig.onPreResult = (text: string) => {
        if (text.toLowerCase().includes(submitPhrase)) {
          // wait for command words to be removed
          setTimeout(() => textInput.submit?.());
          SpeechToElement.endCommandMode();
          return {restart: true, removeNewText: true};
        }
        return null;
      };
    }
    if (newConfig.submitAfterSilence) {
      this._silenceSubmit = new SilenceSubmit(newConfig.submitAfterSilence, newConfig.stopAfterSubmit);
    }
    const serviceName = SpeechToText.getServiceName(newConfig);
    return {serviceName, processedConfig};
  }

  private static getServiceName(config: SpeechToTextConfig) {
    return config.azure ? 'azure' : 'webspeech';
  }

  private buttonClick(textInput: TextInputEl, isInputEnabled: boolean, serviceName: string, config?: ProcessedConfig) {
    const events = config?.events;
    textInput.removePlaceholderStyle();
    SpeechToElement.toggle(serviceName as 'webspeech', {
      insertInCursorLocation: false,
      element: isInputEnabled ? textInput.inputElementRef : undefined,
      onError: () => {
        this.onError();
        this._silenceSubmit?.clearSilenceTimeout();
      },
      onStart: () => {
        this.changeToActive();
        events?.onStart?.();
      },
      onStop: () => {
        this._validationHandler?.();
        this._silenceSubmit?.clearSilenceTimeout();
        this.changeToDefault();
        events?.onStop?.();
      },
      onPauseTrigger: (isStart: boolean) => {
        this._silenceSubmit?.onPause(isStart, textInput, this.elementRef.onclick as Function);
        events?.onPauseTrigger?.(isStart);
      },
      onPreResult: (text: string, isFinal: boolean) => {
        events?.onPreResult?.(text, isFinal);
      },
      onResult: (text: string, isFinal: boolean) => {
        if (isFinal) this._validationHandler?.();
        this._silenceSubmit?.resetSilenceTimeout(textInput, this.elementRef.onclick as Function);
        events?.onResult?.(text, isFinal);
      },
      onCommandModeTrigger: (isStart: boolean) => {
        this.onCommandModeTrigger(isStart);
        events?.onCommandModeTrigger?.(isStart);
      },
      ...config,
    });
  }

  private onCommandModeTrigger(isStart: boolean) {
    if (isStart) {
      this.changeToCommandMode();
    } else {
      this.changeToActive();
    }
  }

  private onError() {
    this._addErrorMessage('speechToText', 'speech input error');
  }

  public static toggleSpeechAfterSubmit(microphoneButton: HTMLElement, stopAfterSubmit = true) {
    microphoneButton.click();
    if (!stopAfterSubmit) setTimeout(() => microphoneButton.click(), SpeechToText.MICROPHONE_RESET_TIMEOUT_MS);
  }
}
