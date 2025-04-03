import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {MicrophoneStyles} from '../../../../../types/microphone';
import {ButtonInnerElements} from '../buttonInnerElements';
import {ButtonStyles} from '../../../../../types/button';
import {InputButton} from '../inputButton';

// commandMode is used for speech to text
// the reason why its called that instead of command is because it is used in SpeechToTextConfig
type AllMicrophoneStyles = MicrophoneStyles & {commandMode?: ButtonStyles};

type Styles = DefinedButtonStateStyles<AllMicrophoneStyles>;

export class MicrophoneButton extends InputButton<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: AllMicrophoneStyles) {
    if (styles?.position === 'dropup-menu') styles.position = 'outside-right'; // not allowed to be in dropup for UX
    const svg = MicrophoneButton.createSVGIconElement();
    super(MicrophoneButton.createMicrophoneElement(), svg, styles?.position, styles);
    this._innerElements = this.createInnerElements(this.customStyles);
    this.changeToDefault();
  }

  private static createSVGIconElement() {
    const svgIconElement = SVGIconUtils.createSVGElement(MICROPHONE_ICON_STRING);
    svgIconElement.id = 'microphone-icon';
    return svgIconElement;
  }

  private createInnerElements(customStyles?: Styles) {
    return {
      default: this.createInnerElement('default', customStyles),
      active: this.createInnerElement('active', customStyles),
      unsupported: this.createInnerElement('unsupported', customStyles),
      commandMode: this.createInnerElement('commandMode', customStyles),
    };
  }

  private createInnerElement(state: keyof MicrophoneButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || this.svg;
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone-button';
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.toggleIconFilter('active');
    this.reapplyStateStyle('active', ['default', 'commandMode']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    this.toggleIconFilter('default');
    this.reapplyStateStyle('default', ['active', 'commandMode']);
    this.isActive = false;
  }

  public changeToCommandMode() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.toggleIconFilter('command');
    this.reapplyStateStyle('commandMode', ['active']);
  }

  public changeToUnsupported() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.elementRef.classList.add('unsupported-microphone');
    this.reapplyStateStyle('unsupported', ['active']);
  }

  private toggleIconFilter(mode: 'default' | 'active' | 'command') {
    const iconElement = this.elementRef.children[0];
    if (iconElement.tagName.toLocaleLowerCase() === 'svg') {
      switch (mode) {
        case 'default':
          iconElement.classList.remove('active-microphone-icon', 'command-microphone-icon');
          iconElement.classList.add('default-microphone-icon');
          break;
        case 'active':
          iconElement.classList.remove('default-microphone-icon', 'command-microphone-icon');
          iconElement.classList.add('active-microphone-icon');
          break;
        case 'command':
          iconElement.classList.remove('active-microphone-icon', 'default-microphone-icon');
          iconElement.classList.add('command-microphone-icon');
          break;
      }
    }
  }
}
