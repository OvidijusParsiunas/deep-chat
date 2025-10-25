import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {DEFAULT, DROPUP_MENU, OUTSIDE_END} from '../../../../../utils/consts/inputConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../../utils/consts/htmlConstants';
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
    if (styles?.position === DROPUP_MENU) styles.position = OUTSIDE_END; // not allowed to be in dropup for UX
    const tooltip = TooltipUtils.tryCreateConfig('Microphone', styles?.tooltip);
    super(MicrophoneButton.createMicrophoneElement(), MICROPHONE_ICON_STRING, styles?.position, tooltip, styles);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this.changeToDefault();
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    const iconId = 'microphone-icon';
    return {
      [DEFAULT]: this.createInnerElements(iconId, DEFAULT, customStyles),
      active: this.createInnerElements(iconId, 'active', customStyles),
      unsupported: this.createInnerElements(iconId, 'unsupported', customStyles),
      commandMode: this.createInnerElements(iconId, 'commandMode', customStyles),
    };
  }

  private static createMicrophoneElement() {
    const buttonElement = CREATE_ELEMENT();
    buttonElement.id = 'microphone-button';
    buttonElement[CLASS_LIST].add('input-button');
    return buttonElement;
  }

  public changeToActive() {
    this.changeElementsByState(this._innerElements.active);
    this.toggleIconFilter('active');
    this.reapplyStateStyle('active', [DEFAULT, 'commandMode']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.changeElementsByState(this._innerElements[DEFAULT]);
    this.toggleIconFilter(DEFAULT);
    this.reapplyStateStyle(DEFAULT, ['active', 'commandMode']);
    this.isActive = false;
  }

  public changeToCommandMode() {
    this.changeElementsByState(this._innerElements.commandMode);
    this.toggleIconFilter('command');
    this.reapplyStateStyle('commandMode', ['active']);
  }

  public changeToUnsupported() {
    this.changeElementsByState(this._innerElements.unsupported);
    this.elementRef[CLASS_LIST].add('unsupported-microphone');
    this.reapplyStateStyle('unsupported', ['active']);
  }

  private toggleIconFilter(mode: 'default' | 'active' | 'command') {
    const iconElement = this.elementRef.children[0];
    if (iconElement.tagName.toLocaleLowerCase() === 'svg') {
      switch (mode) {
        case DEFAULT:
          iconElement[CLASS_LIST].remove('active-microphone-icon', 'command-microphone-icon');
          iconElement[CLASS_LIST].add('default-microphone-icon');
          break;
        case 'active':
          iconElement[CLASS_LIST].remove('default-microphone-icon', 'command-microphone-icon');
          iconElement[CLASS_LIST].add('active-microphone-icon');
          break;
        case 'command':
          iconElement[CLASS_LIST].remove('active-microphone-icon', 'default-microphone-icon');
          iconElement[CLASS_LIST].add('command-microphone-icon');
          break;
      }
    }
  }
}
