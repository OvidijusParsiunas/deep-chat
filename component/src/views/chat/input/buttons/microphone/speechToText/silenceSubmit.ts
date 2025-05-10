import {SubmitAfterSilence} from '../../../../../../types/microphone';
import {TextInputEl} from '../../../textInput/textInput';
import SpeechToElement from 'speech-to-element';
import {SpeechToText} from './speechToText';

export class SilenceSubmit {
  private _silenceTimeout?: number;
  private readonly _silenceMS: number = 2000;
  private readonly _stop: boolean = true;

  constructor(submitAfterSilence: SubmitAfterSilence, stopAfterSubmit?: boolean) {
    if (typeof stopAfterSubmit === 'boolean' && stopAfterSubmit === false) this._stop = false;
    if (typeof submitAfterSilence === 'number') this._silenceMS = submitAfterSilence;
  }

  private setSilenceTimeout(textInput: TextInputEl, buttonClick: () => void) {
    this._silenceTimeout = setTimeout(() => {
      textInput.submit?.();
      SpeechToElement.stop();
      if (!this._stop) {
        setTimeout(buttonClick, SpeechToText.MICROPHONE_RESET_TIMEOUT_MS);
      }
    }, this._silenceMS);
  }

  public clearSilenceTimeout() {
    if (this._silenceTimeout) {
      clearTimeout(this._silenceTimeout);
    }
  }

  public resetSilenceTimeout(textInput: TextInputEl, buttonClick: () => void) {
    this.clearSilenceTimeout();
    this.setSilenceTimeout(textInput, buttonClick);
  }

  public onPause(isStart: boolean, textInput: TextInputEl, buttonClick: () => void) {
    if (isStart) {
      this.resetSilenceTimeout(textInput, buttonClick);
    } else {
      this.clearSilenceTimeout();
    }
  }
}
