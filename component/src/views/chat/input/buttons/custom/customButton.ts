import {DefinedButtonStateStyles, DefinedButtonInnerElements} from '../../../../../types/buttonInternal';
import {CustomButtonStyles, CustomButton as CustomButtonT} from '../../../../../types/customButton';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {ButtonInnerElements} from '../buttonInnerElements';
import {ButtonAccessibility} from '../buttonAccessility';
import {InputButton} from '../inputButton';
import {ButtonCSS} from '../buttonCSS';

type Styles = DefinedButtonStateStyles<CustomButtonStyles>;

export class CustomButton extends InputButton<Styles> {
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private state: keyof CustomButtonStyles = 'default';
  public static readonly INDICATOR_PREFIX = 'custom';

  constructor(customButton: CustomButtonT, index: number) {
    const dropupText = customButton?.dropupText || `Custom ${index}`;
    super(CustomButton.createButtonElement(), customButton?.position, customButton?.styles, dropupText);
    this._innerElements = this.createInnerElements(this._customStyles);
    this.setSetState(customButton);
    this.addClickListener(customButton);
    this.changeState(customButton.initialState, true);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button');
    return buttonElement;
  }

  private createInnerElements(customStyles?: Styles) {
    const svgIconElement = SVGIconUtils.createSVGElement(SUBMIT_ICON_STRING);
    svgIconElement.id = 'submit-icon';
    const baseInnerElement = customStyles?.default?.svg?.content
      ? SVGIconUtils.createSVGElement(customStyles?.default?.svg?.content)
      : svgIconElement;
    return {
      default: this.createInnerElement(baseInnerElement, 'default', customStyles),
      active: this.createInnerElement(baseInnerElement, 'active', customStyles),
      disabled: this.createInnerElement(baseInnerElement, 'disabled', customStyles),
    };
  }

  // prettier-ignore
  private createInnerElement(baseButton: SVGGraphicsElement,
      state: keyof CustomButton['_innerElements'], customStyles?: Styles) {
    return ButtonInnerElements.createSpecificStateElement(this.elementRef, state, customStyles) || baseButton;
  }

  private setSetState(customButton: CustomButtonT) {
    customButton.setState = {
      setDefault: () => {
        this.changeToDefault();
      },
      setActive: () => {
        this.changeToActive();
      },
      setDisabled: () => {
        this.changeToDisabled();
      },
    };
  }

  private addClickListener(customButton: CustomButtonT) {
    this.elementRef.addEventListener('click', () => {
      const resultState = customButton.onClick?.(this.state);
      if (resultState === 'default' || resultState === 'active' || resultState === 'disabled') {
        this.changeState(resultState);
      }
    });
  }

  private changeState(state?: keyof CustomButtonStyles, override?: boolean) {
    if (state === 'disabled') {
      this.changeToDisabled();
    } else if (state === 'active') {
      this.changeToActive();
    } else {
      this.changeToDefault(override);
    }
  }

  private changeToDefault(override?: boolean) {
    if (!override && this.state === 'default') return;
    this.elementRef.replaceChildren(this._innerElements.default);
    if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
    if (this._customStyles?.disabled) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.disabled);
    this.reapplyStateStyle('default', ['active', 'disabled']);
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this.state = 'default';
  }

  private changeToActive() {
    if (this.state === 'active') return;
    this.elementRef.replaceChildren(this._innerElements.active);
    this.reapplyStateStyle('active', ['disabled', 'default']);
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this.state = 'active';
  }

  private changeToDisabled() {
    if (this.state === 'disabled') return;
    this.elementRef.replaceChildren(this._innerElements.disabled);
    if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
    if (this._customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.default);
    this.reapplyStateStyle('disabled', ['default', 'active']);
    ButtonAccessibility.addAriaDisabled(this.elementRef);
    this.state = 'disabled';
  }
}
