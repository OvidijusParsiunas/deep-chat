import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {MICROPHONE_ICON_STRING} from '../../../../../icons/microphone';
import {MicrophoneStyles} from '../../../../../types/microphone';
import {ButtonStyles} from '../../../../../types/button';
import {TooltipUtils} from '../tooltip/tooltipUtils';
import {InputButton} from '../inputButton';

// commandMode is used for speech to text
// the reason why its called that instead of command is because it is used in SpeechToTextConfig
type AllMicrophoneStyles = MicrophoneStyles & {commandMode?: ButtonStyles};

type Styles = Omit<DefinedButtonStateStyles<AllMicrophoneStyles>, 'tooltip'>;

export class MicrophoneButton extends InputButton<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: AllMicrophoneStyles) {
    if (styles?.position === 'dropup-menu') styles.position = 'outside-right'; // not allowed to be in dropup for UX
    const tooltip = TooltipUtils.tryCreateConfig('Microphone', styles?.tooltip);
    super(MicrophoneButton.createMicrophoneElement(), MICROPHONE_ICON_STRING, styles?.position, tooltip, styles);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this.changeToDefault();
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    const iconId = 'microphone-icon';
    return {
      default: this.createInnerElements(iconId, 'default', customStyles),
      active: this.createInnerElements(iconId, 'active', customStyles),
      unsupported: this.createInnerElements(iconId, 'unsupported', customStyles),
      commandMode: this.createInnerElements(iconId, 'commandMode', customStyles),
    };
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    buttonElement.id = 'microphone-button';
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  public changeToActive() {
    this.changeElementsByState(this._innerElements.active);
    this.toggleIconFilter('active');
    this.reapplyStateStyle('active', ['default', 'commandMode']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.changeElementsByState(this._innerElements.default);
    this.toggleIconFilter('default');
    this.reapplyStateStyle('default', ['active', 'commandMode']);
    this.isActive = false;
  }

  public changeToCommandMode() {
    this.changeElementsByState(this._innerElements.commandMode);
    this.toggleIconFilter('command');
    this.reapplyStateStyle('commandMode', ['active']);
  }

  public changeToUnsupported() {
    this.changeElementsByState(this._innerElements.unsupported);
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
