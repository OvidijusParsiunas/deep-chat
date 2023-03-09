import {MicrophoneStyles, SpeechInput} from '../../../../../types/speechInput';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';
import {CustomStyle} from '../../../../../types/styles';
import {ButtonStyleEvents} from '../buttonStyleEvents';
import {SpeechToText} from './speechToText';
import {
  DefinedButtonInnerElements,
  DefinedButtonStateStyles,
  ButtonInnerElement,
} from '../../../../../types/buttonInternal';

type Styles = DefinedButtonStateStyles<MicrophoneStyles>;

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class MicrophoneButton extends ButtonStyleEvents<Styles> {
  private readonly _microphoneIcon: ButtonInnerElement;
  readonly _activeStyle: CustomStyle = {
    filter: `brightness(0) saturate(100%) invert(72%) sepia(5%) saturate(4533%) hue-rotate(183deg)
      brightness(100%) contrast(102%)`,
  };
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  // private readonly _inputElementRef: HTMLElement;

  constructor(speechInput: SpeechInput) {
    super(MicrophoneButton.createMicrophoneElement(), speechInput as Styles);
    this._innerElements = MicrophoneButton.createInnerElements(this._customStyles);
    this._microphoneIcon = this._innerElements.default;
    this.elementRef.appendChild(this._microphoneIcon);
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!speechRecognition) {
      this.elementRef.classList.add('disabled-microphone');
    } else {
      new SpeechToText(this, speechRecognition);
    }
    // this._inputElementRef = inputElement;
  }

  private static createInnerElements(customStyles?: Styles) {
    const baseButton = MicrophoneButton.createSVGIconElement();
    return {
      default: MicrophoneButton.createInnerElement(baseButton, 'default', customStyles),
      active: MicrophoneButton.createInnerElement(baseButton, 'active', customStyles),
      disabled: MicrophoneButton.createInnerElement(baseButton, 'disabled', customStyles),
    };
  }

  // prettier-ignore
  private static createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof MicrophoneButton['_innerElements'], customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(state, 'microphone-icon', customStyles) || baseButton;
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone-button';
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtil.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    return svgIconElement;
  }
}
