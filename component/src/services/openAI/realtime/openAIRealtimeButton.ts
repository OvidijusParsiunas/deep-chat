import {CustomButtonInnerElements} from '../../../views/chat/input/buttons/customButtonInnerElements';
import {DefinedButtonStateStyles, DefinedButtonInnerElements} from '../../../types/buttonInternal';
import {ButtonAccessibility} from '../../../views/chat/input/buttons/buttonAccessility';
import {InputButton} from '../../../views/chat/input/buttons/inputButton';
import {SVGIconUtils} from '../../../utils/svg/svgIconUtils';
import {ButtonStyles} from '../../../types/button';

type DefStyles = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unsupported?: ButtonStyles;
};

type Styles = DefinedButtonStateStyles<DefStyles>;

export class OpenAIRealtimeButton extends InputButton<Styles> {
  private static readonly EMPTY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  isActive = false;

  constructor(styles?: DefStyles) {
    super(OpenAIRealtimeButton.createMicrophoneElement(), undefined, styles);
    this._innerElements = this.createInnerElements(this._customStyles);
    this.changeToDefault();
  }

  private createInnerElements(customStyles?: Styles) {
    const baseButton = SVGIconUtils.createSVGElement(OpenAIRealtimeButton.EMPTY_SVG);
    return {
      default: this.createInnerElement(baseButton, 'default', customStyles),
      active: this.createInnerElement(baseButton, 'active', customStyles),
      unsupported: this.createInnerElement(baseButton, 'unsupported', customStyles),
    };
  }

  // prettier-ignore
  private createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof OpenAIRealtimeButton['_innerElements'], customStyles?: Styles) {
    return CustomButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || baseButton;
  }

  private static createMicrophoneElement() {
    const buttonElement = document.createElement('div');
    // buttonElement.classList.add('input-button');
    ButtonAccessibility.addAttributes(buttonElement);
    return buttonElement;
  }

  public changeToActive() {
    this.elementRef.replaceChildren(this._innerElements.active);
    this.toggleIconFilter('active');
    this.reapplyStateStyle('active', ['default']);
    this.isActive = true;
  }

  public changeToDefault() {
    this.elementRef.replaceChildren(this._innerElements.default);
    this.toggleIconFilter('default');
    this.reapplyStateStyle('default', ['active']);
    this.isActive = false;
  }

  public changeToUnsupported() {
    this.elementRef.replaceChildren(this._innerElements.unsupported);
    this.reapplyStateStyle('unsupported', ['active']);
  }

  private toggleIconFilter(mode: 'default' | 'active') {
    const iconElement = this.elementRef.children[0];
    if (iconElement.tagName.toLocaleLowerCase() === 'svg') {
      switch (mode) {
        case 'default':
          // iconElement.classList.remove('active-microphone-icon', 'command-microphone-icon');
          // iconElement.classList.add('default-microphone-icon');
          break;
        case 'active':
          // iconElement.classList.remove('default-microphone-icon', 'command-microphone-icon');
          // iconElement.classList.add('active-microphone-icon');
          break;
      }
    }
  }
}
