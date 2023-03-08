/* eslint-disable max-len */

import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class Microphone {
  readonly elementRef: HTMLElement;
  // private readonly _inputElementRef: HTMLElement;

  constructor() {
    this.elementRef = Microphone.createMicrophoneElement();
    // this._inputElementRef = inputElement;
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone';
    buttonElement.classList.add('button-container');
    buttonElement.onclick = Microphone.start;
    const svgIconElement = SVGIconUtil.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    buttonElement.appendChild(svgIconElement);
    return buttonElement;
  }

  private static start() {
    const speechRecognition = webkitSpeechRecognition;
    const recognition = new speechRecognition();
    recognition.start();
    recognition.onresult = function (event) {
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
    // recognition.onspeechend = function () {
    //   recognition.stop();
    //   // testBtn.disabled = false;
    //   // testBtn.textContent = 'Start new test';
    // };

    // recognition.onerror = function (event) {
    //   // testBtn.disabled = false;
    //   // testBtn.textContent = 'Start new test';
    //   // diagnosticPara.textContent = `Error occurred in recognition: ${event.error}`;
    // };

    // recognition.onaudiostart = function (event) {
    //   //Fired when the user agent has started to capture audio.
    //   console.log('SpeechRecognition.onaudiostart');
    // };

    // recognition.onaudioend = function (event) {
    //   //Fired when the user agent has finished capturing audio.
    //   console.log('SpeechRecognition.onaudioend');
    // };

    // recognition.onend = function (event) {
    //   //Fired when the speech recognition service has disconnected.
    //   console.log('SpeechRecognition.onend');
    // };

    // recognition.onnomatch = function (event) {
    //   //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    //   console.log('SpeechRecognition.onnomatch');
    // };

    // recognition.onsoundstart = function (event) {
    //   //Fired when any sound — recognisable speech or not — has been detected.
    //   console.log('SpeechRecognition.onsoundstart');
    // };

    // recognition.onsoundend = function (event) {
    //   //Fired when any sound — recognisable speech or not — has stopped being detected.
    //   console.log('SpeechRecognition.onsoundend');
    // };

    // recognition.onspeechstart = function (event) {
    //   //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    //   console.log('SpeechRecognition.onspeechstart');
    // };
    // recognition.onstart = function (event) {
    //   //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    //   console.log('SpeechRecognition.onstart');
    // };
  }
}
