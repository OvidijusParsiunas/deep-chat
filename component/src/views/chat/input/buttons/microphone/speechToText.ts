import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {MicrophoneButton} from './microphoneButton';

/* eslint-disable max-len */
export class SpeechToText {
  private readonly _recognition?: SpeechRecognition;
  private readonly _microphone: MicrophoneButton;

  constructor(microphone: MicrophoneButton, speechRecognition: {new (): SpeechRecognition}) {
    this._microphone = microphone;
    this._recognition = new speechRecognition();
    microphone.elementRef.onclick = this.start.bind(this);
  }
  private recordingStarted() {
    console.log('audio - start');
    Object.assign(this._microphone.elementRef.style, this._microphone._activeStyle);
  }

  private recordingEnded() {
    console.log('audio - end');
    StyleUtils.unsetStyle(this._microphone.elementRef, this._microphone._activeStyle);
  }

  private start() {
    if (!this._recognition) return;
    this._recognition.start();
    this._recognition.onresult = function (event) {
      console.log(event);
      // const speechResult = event.results[0][0].transcript.toLowerCase();
      // for (var i = event.resultIndex; i < event.results.length; ++i) {
      //   if (event.results[i].isFinal) {
      //     final_transcript += event.results[i][0].transcript;
      //   } else {
      //     interim_transcript += event.results[i][0].transcript;
      //   }
      // }

      // console.log(`Confidence: ${event.results[0][0].confidence}`);
    };
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

    // this._recognition.onnomatch = function (event) {
    //   //Fired when the speech recognition service returns a final result with no significant this._recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    //   console.log('SpeechRecognition.onnomatch');
    // };

    // this._recognition.onsoundstart = function (event) {
    //   //Fired when any sound — recognisable speech or not — has been detected.
    //   console.log('SpeechRecognition.onsoundstart');
    // };

    // this._recognition.onsoundend = function (event) {
    //   //Fired when any sound — recognisable speech or not — has stopped being detected.
    //   console.log('SpeechRecognition.onsoundend');
    // };

    // this._recognition.onspeechstart = function (event) {
    //   //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    //   console.log('SpeechRecognition.onspeechstart');
    // };
    // this._recognition.onstart = function (event) {
    //   //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    //   console.log('SpeechRecognition.onstart');
    // };
  }
}
