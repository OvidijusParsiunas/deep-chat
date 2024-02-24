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

  constructor(deepChat: DeepChat, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    super(typeof deepChat.speechToText === 'object' ? deepChat.speechToText?.button : {});
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
    if (newConfig.submitAfterSilence) this._silenceSubmit = new SilenceSubmit(newConfig.submitAfterSilence);
    const serviceName = SpeechToText.getServiceName(newConfig);
    return {serviceName, processedConfig};
  }

  private static getServiceName(config: SpeechToTextConfig) {
    return config.azure ? 'azure' : 'webspeech';
  }

  private buttonClick(textInput: TextInputEl, isInputEnabled: boolean, serviceName: string, config?: ProcessedConfig) {
    textInput.removeTextIfPlaceholder();
    SpeechToElement.toggle(serviceName as 'webspeech', {
      insertInCursorLocation: false,
      element: isInputEnabled ? textInput.inputElementRef : undefined,
      onError: () => {
        this.onError();
        this._silenceSubmit?.clearSilenceTimeout();
      },
      onStart: this.changeToActive.bind(this),
      onStop: () => {
        this._validationHandler?.();
        this._silenceSubmit?.clearSilenceTimeout();
        this.changeToDefault();
      },
      onPauseTrigger: (isStart: boolean) => {
        this._silenceSubmit?.onPause(isStart, textInput, this.elementRef.onclick as Function);
      },
      onResult: (_, isFinal: boolean) => {
        if (isFinal) this._validationHandler?.();
        this._silenceSubmit?.resetSilenceTimeout(textInput, this.elementRef.onclick as Function);
      },
      onCommandModeTrigger: this.onCommandModeTrigger.bind(this),
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
}
