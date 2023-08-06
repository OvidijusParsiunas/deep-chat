import {SpeechToTextConfig} from '../../../../../types/microphone';
import {OnPreResult} from 'speech-to-element/dist/types/options';
import {TextInputEl} from '../../textInput/textInput';
import {Messages} from '../../../messages/messages';
import {MicrophoneButton} from './microphoneButton';
import {DeepChat} from '../../../../../deepChat';
import SpeechToElement from 'speech-to-element';

type ProcessedConfig = SpeechToTextConfig & {onPreResult?: OnPreResult};

export type AddErrorMessage = Messages['addNewErrorMessage'];

export class SpeechToText extends MicrophoneButton {
  private readonly _addErrorMessage: AddErrorMessage;

  constructor(deepChat: DeepChat, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    super(typeof deepChat.speechToText === 'object' ? deepChat.speechToText?.button : {});
    const {serviceName, processedConfig} = SpeechToText.processConfiguration(textInput, deepChat.speechToText);
    this._addErrorMessage = addErrorMessage;
    if (serviceName === 'webspeech' && !SpeechToElement.isWebSpeechSupported()) {
      this.changeToUnsupported();
    } else {
      const isInputEnabled = !deepChat.textInput || !deepChat.textInput.disabled;
      this.elementRef.onclick = this.buttonClick.bind(this, textInput, isInputEnabled, serviceName, processedConfig);
    }
  }

  // prettier-ignore
  private static processConfiguration(textInput: TextInputEl, config?: boolean | SpeechToTextConfig):
      {serviceName: string, processedConfig: ProcessedConfig} {
    const newConfig = typeof config === 'object' ? config : {};
    const webSpeechConfig = typeof newConfig.webSpeech === 'object' ? newConfig.webSpeech : {};
    const azureConfig = newConfig.azure || {};
    const processedConfig: ProcessedConfig = {
      displayInterimResults: newConfig.displayInterimResults ?? undefined,
      textColor: newConfig.textColor ?? undefined,
      stopAfterSilenceMs: newConfig.stopAfterSilenceMs ?? undefined,
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
    const serviceName = SpeechToText.getServiceName(newConfig);
    return {serviceName, processedConfig};
  }

  private static getServiceName(config: SpeechToTextConfig) {
    if (config.webSpeech) {
      return 'webspeech';
    }
    if (config.azure) {
      return 'azure';
    }
    return 'webspeech';
  }

  private buttonClick(textInput: TextInputEl, isInputEnabled: boolean, serviceName: string, config?: SpeechToTextConfig) {
    textInput.removeTextIfPlaceholder();
    SpeechToElement.toggle(serviceName as 'webspeech', {
      insertInCursorLocation: false,
      element: isInputEnabled ? textInput.inputElementRef : undefined,
      onError: this.onError.bind(this),
      onStart: this.changeToActive.bind(this),
      onStop: this.changeToDefault.bind(this),
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
