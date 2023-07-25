import {MicrophoneStyles} from '../../../../../types/microphone';
import {TextInputEl} from '../../textInput/textInput';
import {Messages} from '../../../messages/messages';
import {MicrophoneButton} from './microphoneButton';
import SpeechToElement from 'speech-to-element';

export type AddErrorMessage = Messages['addNewErrorMessage'];

export class SpeechToText extends MicrophoneButton {
  private readonly _addErrorMessage: AddErrorMessage;

  constructor(microphone: true | MicrophoneStyles, textInput: TextInputEl, addErrorMessage: AddErrorMessage) {
    super(typeof microphone === 'object' ? microphone : {});
    if (!SpeechToElement.isWebSpeechAPISupported()) {
      this.changeToUnsupported();
    }
    this.elementRef.onclick = this.buttonClick.bind(this, textInput);
    this._addErrorMessage = addErrorMessage;
  }

  private buttonClick(textInput: TextInputEl) {
    SpeechToElement.toggle('webspeech', {
      insertInCursorLocation: false,
      element: textInput.inputElementRef,
      onError: this.onError,
      onStop: this.changeToDefault,
      onResult: (text: string) => {
        console.log(text);
        textInput.removeTextIfPlaceholder();
      },
    });
  }

  private onError() {
    this._addErrorMessage('speechToText', 'speech input error');
    this.changeToDefault();
  }
}
