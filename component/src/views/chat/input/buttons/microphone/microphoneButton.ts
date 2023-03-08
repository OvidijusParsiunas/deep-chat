/* eslint-disable max-len */

import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';
import {CustomStyle} from '../../../../../types/styles';

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class Microphone {
  readonly elementRef: HTMLElement;
  private readonly _microphoneIcon: SVGGraphicsElement;
  private readonly _recognition?: SpeechRecognition;
  private readonly _activeStyle: CustomStyle = {
    filter: `brightness(0) saturate(100%) invert(72%) sepia(5%) saturate(4533%) hue-rotate(183deg) brightness(100%) contrast(102%)`,
  };
  // private readonly _inputElementRef: HTMLElement;

  constructor() {
    this._microphoneIcon = Microphone.createSVGIconElement();
    this.elementRef = this.createMicrophoneElement();
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!speechRecognition) {
      this.elementRef.classList.add('disabled-microphone');
    } else {
      this._recognition = new speechRecognition();
    }
    // this._inputElementRef = inputElement;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtil.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    return svgIconElement;
  }

  private createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone-button';
    buttonElement.classList.add('input-button');
    buttonElement.onclick = this.start.bind(this);
    buttonElement.appendChild(this._microphoneIcon);
    return buttonElement;
  }

  private static recordingStarted(microphoneIcon: SVGGraphicsElement, activeStyle: CustomStyle) {
    console.log('audio - start');
    Object.assign(microphoneIcon.style, activeStyle);
  }

  private static recordingEnded(microphoneIcon: SVGGraphicsElement, activeStyle: CustomStyle) {
    console.log('audio - end');
    StyleUtils.unsetStyle(microphoneIcon as unknown as HTMLElement, activeStyle);
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

    this._recognition.onaudiostart = Microphone.recordingStarted.bind(this, this._microphoneIcon, this._activeStyle);

    this._recognition.onaudioend = Microphone.recordingEnded.bind(this, this._microphoneIcon, this._activeStyle);

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
