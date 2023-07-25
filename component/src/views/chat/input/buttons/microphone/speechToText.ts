import {SpeechToTextConfig} from '../../../../../types/microphone';
import {TextInputEl} from '../../textInput/textInput';
import {Messages} from '../../../messages/messages';
import {MicrophoneButton} from './microphoneButton';
import {DeepChat} from '../../../../../deepChat';
import SpeechToElement from 'speech-to-element';

export type AddErrorMessage = Messages['addNewErrorMessage'];

export class SpeechToText extends MicrophoneButton {
  private readonly _addErrorMessage: AddErrorMessage;

  constructor(deepChat: DeepChat, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    super(typeof deepChat.speechToText === 'object' ? deepChat.speechToText : {});
    const {serviceName, processedConfig} = SpeechToText.processConfiguration(deepChat.speechToText);
    this._addErrorMessage = addErrorMessage;
    if (serviceName === 'webspeech' && !SpeechToElement.isWebSpeechAPISupported()) {
      this.changeToUnsupported();
    } else {
      const isInputDisabled = !deepChat.textInput || !deepChat.textInput.disabled;
      this.elementRef.onclick = this.buttonClick.bind(this, textInput, isInputDisabled, serviceName, processedConfig);
    }
  }

  private buttonClick(textInput: TextInputEl, isInputDisabled: boolean, serviceName: string, config?: SpeechToTextConfig) {
    const confirmPhrase = 'confirm';
    SpeechToElement.toggle(serviceName as 'webspeech', {
      insertInCursorLocation: false,
      element: isInputDisabled ? textInput.inputElementRef : undefined,
      onError: this.onError,
      onStop: this.changeToDefault,
      onResult: (text: string) => {
        const lowerCaseText = text.toLowerCase();
        if (lowerCaseText.includes(confirmPhrase)) {
          textInput.submit?.();
        }
        textInput.removeTextIfPlaceholder();
      },
      ...config,
    });
  }

  // prettier-ignore
  private static processConfiguration(config?: boolean | SpeechToTextConfig):
      {serviceName: string, processedConfig: SpeechToTextConfig} {
    const newConfig = typeof config === 'object' ? config : {};
    const webSpeechConfig = typeof newConfig.webSpeech === 'object' ? newConfig.webSpeech : {};
    const azureConfig = typeof newConfig.azure === 'object' ? newConfig.azure : {};
    const processedConfig = {
      displayInterimResults: newConfig.displayInterimResults ?? undefined,
      textColor: newConfig.textColor ?? undefined,
      stopAfterSilenceMS: newConfig.stopAfterSilenceMS ?? undefined,
      translations: newConfig.translations ?? undefined,
      ...webSpeechConfig,
      ...azureConfig,
    };
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

  private onError() {
    this._addErrorMessage('speechToText', 'speech input error');
    this.changeToDefault();
  }
}
