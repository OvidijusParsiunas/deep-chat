import {KeyboardInput} from '../../keyboardInput/keyboardInput';
import {MicrophoneButton} from './microphoneButton';

/* eslint-disable max-len */
export class SpeechToText {
  private readonly _recognition?: SpeechRecognition;
  private readonly _microphone: MicrophoneButton;
  private readonly _inputElement: HTMLElement;
  private _interimTextSpan: HTMLSpanElement;
  private _finalTextSpan: HTMLSpanElement;
  private _interimTranscript = '';
  private _finalTranscript = '';
  private prefixText = '';

  constructor(microphone: MicrophoneButton, speechRecognition: {new (): SpeechRecognition}, inputElement: HTMLElement) {
    this._microphone = microphone;
    this._recognition = new speechRecognition();
    this._recognition.continuous = true;
    this._inputElement = inputElement;
    this._finalTextSpan = document.createElement('span');
    this._interimTextSpan = document.createElement('span');
    this._interimTextSpan.id = 'interim-text';
    microphone.elementRef.onclick = this.buttonClick.bind(this);
  }

  private buttonClick() {
    if (this._microphone.isActive) {
      this._recognition?.stop();
    } else {
      this.start();
    }
  }

  private onResult(event: SpeechRecognitionEvent) {
    console.log(event);
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const speechResult = event.results[i][0].transcript.toLowerCase();
      if (event.results[i].isFinal) {
        this._finalTranscript += speechResult;
      } else {
        this._interimTranscript += speechResult;
      }
      this._finalTranscript = SpeechToText.capitalizeFirstLetter(this._finalTranscript);
      // this._finalTextSpan.innerHTML = linebreak(final_transcript);
      this._finalTextSpan.innerHTML = this._finalTranscript;
      this._interimTextSpan.innerHTML = this._interimTranscript;
    }
  }

  private start() {
    if (!this._recognition) return;
    this._recognition.start();
    this._recognition.onresult = this.onResult.bind(this);
    // this._recognition.onspeechend = function () {
    //   this._recognition.stop();
    //   // testBtn.disabled = false;
    //   // testBtn.textContent = 'Start new test';
    // };

    // this._recognition.onerror = function (event) {
    //   // testBtn.disabled = false;
    //   // testBtn.textContent = 'Start new test';
    //   // diagnosticPara.textContent = `Error occurred in recognition: ${event.error}`;
    // };

    this._recognition.onaudiostart = this.recordingStarted.bind(this);

    this._recognition.onaudioend = this.recordingEnded.bind(this);

    // this._recognition.onend = function (event) {
    //   //Fired when the speech recognition service has disconnected.
    //   console.log('SpeechRecognition.onend');
    // };
  }

  private recordingStarted() {
    console.log('audio - start');
    this.prepareText();
    this.appendSpans();
    this._microphone.changeToActive();
  }

  private recordingEnded() {
    console.log('audio - end');
    this.removeSpans();
    this._microphone.changeToDefault();
  }

  private static isCharASpace(character: string) {
    return !!/^\s*$/.test(character);
  }

  private prepareText() {
    KeyboardInput.removeTextIfPlaceholder(this._inputElement);
    const lastCharacter = this._inputElement.textContent?.charAt(this._inputElement.textContent.length - 1) || '';
    this.prefixText = SpeechToText.isCharASpace(lastCharacter) ? '' : ' ';
  }

  private appendSpans() {
    this._inputElement.appendChild(this._finalTextSpan);
    this._inputElement.appendChild(this._interimTextSpan);
  }

  private removeSpans() {
    this._inputElement.removeChild(this._finalTextSpan);
    this._inputElement.removeChild(this._interimTextSpan);
  }

  private processText(text: string, isFinal: boolean) {
    return `${isFinal ? this.prefixText : ' '}${text}`;
  }

  private static capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
