import {SubmitAfterSilence} from '../../../../../../types/microphone';
import {TextInputEl} from '../../../textInput/textInput';
import SpeechToElement from 'speech-to-element';
import {SpeechToText} from './speechToText';

export class SilenceSubmit {
  private _silenceTimeout?: number;
  private readonly silenceMS: number = 2000;
  private readonly stop: boolean = true;

  constructor(submitAfterSilence: SubmitAfterSilence, stopAfterSubmit?: boolean) {
    if (typeof stopAfterSubmit === 'boolean' && stopAfterSubmit === false) this.stop = false;
    if (typeof submitAfterSilence === 'number') this.silenceMS = submitAfterSilence;
  }

  private setSilenceTimeout(textInput: TextInputEl, buttonClick: Function) {
    this._silenceTimeout = setTimeout(() => {
      textInput.submit?.();
      SpeechToElement.stop();
      if (!this.stop) {
        setTimeout(buttonClick, SpeechToText.MICROPHONE_RESET_TIMEOUT_MS);
      }
    }, this.silenceMS);
  }

  public clearSilenceTimeout() {
    if (this._silenceTimeout) {
      clearTimeout(this._silenceTimeout);
    }
  }

  public resetSilenceTimeout(textInput: TextInputEl, buttonClick: Function) {
    this.clearSilenceTimeout();
    this.setSilenceTimeout(textInput, buttonClick);
  }

  public onPause(isStart: boolean, textInput: TextInputEl, buttonClick: Function) {
    if (isStart) {
      this.resetSilenceTimeout(textInput, buttonClick);
    } else {
      this.clearSilenceTimeout();
    }
  }
}
