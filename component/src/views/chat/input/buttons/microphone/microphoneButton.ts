import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';
import {SpeechInput} from '../../../../../types/speechInput';
import {CustomStyle} from '../../../../../types/styles';
import {SpeechToText} from './speechToText';

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class MicrophoneButton {
  readonly elementRef: HTMLElement;
  private readonly _microphoneIcon: SVGGraphicsElement;
  readonly _activeStyle: CustomStyle = {
    filter: `brightness(0) saturate(100%) invert(72%) sepia(5%) saturate(4533%) hue-rotate(183deg)
      brightness(100%) contrast(102%)`,
  };
  // private readonly _inputElementRef: HTMLElement;

  constructor(speechInput: SpeechInput) {
    this._microphoneIcon = MicrophoneButton.createSVGIconElement();
    this.elementRef = this.createMicrophoneElement();
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!speechRecognition) {
      this.elementRef.classList.add('disabled-microphone');
    } else {
      new SpeechToText(this, speechRecognition);
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
    buttonElement.appendChild(this._microphoneIcon);
    return buttonElement;
  }
}
