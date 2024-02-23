import {SubmitAfterSilence} from '../../../../../../types/microphone';
import {TextInputEl} from '../../../textInput/textInput';
import SpeechToElement from 'speech-to-element';

export class SilenceSubmit {
  private _silenceTimeout?: number;
  private readonly ms: number = 2000;
  private readonly stop: boolean = true;
  private static readonly MICROPHONE_RESET_TIMEOUT_MS = 300;

  constructor(submitAfterSilence: SubmitAfterSilence) {
    if (typeof submitAfterSilence === 'object') {
      const {ms, stop} = submitAfterSilence;
      if (ms && ms > 0) this.ms = ms;
      if (stop !== undefined && stop !== null) this.stop = stop;
    }
  }

  private setSilenceTimeout(textInput: TextInputEl, buttonClick: Function) {
    this._silenceTimeout = setTimeout(() => {
      textInput.submit?.();
      SpeechToElement.stop();
      if (!this.stop) {
        setTimeout(buttonClick, SilenceSubmit.MICROPHONE_RESET_TIMEOUT_MS);
      }
    }, this.ms);
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
