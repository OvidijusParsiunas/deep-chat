import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {MicrophoneStyles, Microphone} from '../../../../../types/microphone';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {CustomButtonInnerElements} from '../customButtonInnerElements';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {AddErrorMessage, SpeechToText} from './speechToText';
import {ButtonStyling} from '../buttonStyling';

type Styles = DefinedButtonStateStyles<MicrophoneStyles>;

// WORK - check if webapi is available for browser
// WORK - chat gpt/microsoft integration
export class MicrophoneButton extends ButtonStyling<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(inputElement: HTMLElement, addErrorMessage: AddErrorMessage, microphone: Microphone) {
    super(MicrophoneButton.createMicrophoneElement(), 'outside-right', typeof microphone === 'boolean' ? {} : microphone);
    this._innerElements = MicrophoneButton.createInnerElements(this._customStyles);
    this.changeToDefault();
    // const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // if (!speechRecognition) {
    //   this.changeToUnsupported();
    // } else {
    //   new SpeechToText(this, speechRecognition, inputElement, addErrorMessage);
    // }
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
    const svgIconElement = SVGIconUtils.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    return svgIconElement;
  }

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.toggleIconFilter(false);
    this.reapplyStateStyle('active', ['default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    this.toggleIconFilter(true);
    this.reapplyStateStyle('default', ['active']);
    this.isActive = false;
  }

  private changeToUnsupported() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.elementRef.classList.add('unsupported-microphone');
    this.reapplyStateStyle('unsupported', ['active']);
  }

  private toggleIconFilter(isDefault: boolean) {
    const iconElement = this.elementRef.children[0];
    if (iconElement.tagName.toLocaleLowerCase() === 'svg') {
      if (isDefault) {
        iconElement.classList.remove('active-microphone-icon');
        iconElement.classList.add('default-microphone-icon');
      } else {
        iconElement.classList.replace('default-microphone-icon', 'active-microphone-icon');
      }
    }
  }
}
