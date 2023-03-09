import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {MicrophoneStyles, SpeechInput} from '../../../../../types/speechInput';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';
import {ButtonStyleEvents} from '../buttonStyleEvents';
import {SpeechToText} from './speechToText';

type Styles = DefinedButtonStateStyles<MicrophoneStyles>;

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class MicrophoneButton extends ButtonStyleEvents<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;
  // private readonly _inputElementRef: HTMLElement;

  constructor(speechInput: SpeechInput, inputElement: HTMLElement) {
    super(MicrophoneButton.createMicrophoneElement(), typeof speechInput === 'boolean' ? {} : speechInput);
    this._innerElements = MicrophoneButton.createInnerElements(this._customStyles);
    this.changeToDefault();
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!speechRecognition) {
      this.changeToUnsupported();
    } else {
      new SpeechToText(this, speechRecognition, inputElement);
    }
    // this._inputElementRef = inputElement;
  }

  private static createInnerElements(customStyles?: Styles) {
    const baseButton = MicrophoneButton.createSVGIconElement();
    return {
      default: MicrophoneButton.createInnerElement(baseButton, 'default', customStyles),
      active: MicrophoneButton.createInnerElement(baseButton, 'active', customStyles),
      unsupported: MicrophoneButton.createInnerElement(baseButton, 'unsupported', customStyles),
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

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.elementRef.classList.replace('default-microphone', 'active-microphone');
    this.reapplyStateStyle(false, 'active', ['default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    this.elementRef.classList.remove('active-microphone');
    this.elementRef.classList.add('default-microphone');
    this.reapplyStateStyle(true, 'default', ['active']);
    this.isActive = false;
  }

  private changeToUnsupported() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.elementRef.classList.add('unsupported-microphone');
    this.reapplyStateStyle(true, 'unsupported', ['active']);
  }
}
