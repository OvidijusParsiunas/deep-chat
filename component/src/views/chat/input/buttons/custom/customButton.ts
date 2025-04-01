import {DefinedButtonStateStyles, DefinedButtonInnerElements} from '../../../../../types/buttonInternal';
import {StatefulEvents} from '../../../../../utils/element/statefulEvents';
import {SVGIconUtils} from '../../../../../utils/svg/svgIconUtils';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {CustomButtonDropupStyle} from './customButtonDropupStyle';
import {ButtonInnerElements} from '../buttonInnerElements';
import {HTMLUtils} from '../../../messages/html/htmlUtils';
import {ButtonAccessibility} from '../buttonAccessility';
import {DropupItem} from '../../dropup/dropupItem';
import {InputButton} from '../inputButton';
import {ButtonCSS} from '../buttonCSS';
import {
  CustomButton as CustomButtonT,
  CustomDropupItemStateStyles,
  CustomButtonStyles,
  CustomDropupItemStyles,
} from '../../../../../types/customButton';

type Styles = DefinedButtonStateStyles<CustomButtonStyles>;

export class CustomButton extends InputButton<Styles> {
  public static readonly INDICATOR_PREFIX = 'custom';
  public static readonly BUTTON_CLASS = 'custom-button';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private _originalElementRef: HTMLElement | undefined; // currently used only for dropup items
  private _state: keyof CustomButtonStyles = 'default';
  private readonly _onClick: CustomButtonT['onClick'];
  private readonly _dropupStyles: CustomDropupItemStyles;

  constructor(customButton: CustomButtonT, index: number) {
    const dropupText = customButton?.styles?.dropup?.text || `Custom ${index}`;
    super(CustomButton.createButtonElement(), customButton?.position, customButton?.styles?.button, dropupText);
    this._innerElements = this.createInnerElements(this._customStyles);
    this._onClick = customButton.onClick;
    this._dropupStyles = CustomButtonDropupStyle.createDropupStyles(customButton.styles?.dropup);
    this.setSetState(customButton);
    this.addClickListener();
    this.changeState(customButton.initialState, true);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button', CustomButton.BUTTON_CLASS);
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

  private addClickListener() {
    this.elementRef.addEventListener('click', () => {
      const resultState = this._onClick?.(this._state);
      if (resultState === 'default' || resultState === 'active' || resultState === 'disabled') {
        this.changeState(resultState);
      }
    });
  }

  private changeState(state?: keyof CustomButtonStyles, override?: boolean) {
    if (state === 'disabled') {
      this.changeToDisabled(override);
    } else if (state === 'active') {
      this.changeToActive(override);
    } else {
      this.changeToDefault(override);
    }
  }

  private assignDropupItemStyle(styles?: CustomDropupItemStateStyles) {
    // doesn't have a parent element when inserted at the start
    if (this.elementRef.parentElement && this._originalElementRef) {
      // creating a new item as need to reapply event listeners in stateful events
      this.elementRef = HTMLUtils.replaceElementWithNewClone(this.elementRef, this._originalElementRef);
    }
    Object.assign(this.elementRef.style, styles?.item?.default);
    const statefulStyles = StyleUtils.processStateful(styles?.item || {});
    StatefulEvents.add(this.elementRef, statefulStyles);
    this.addClickListener();
    const iconContainerElement = this.elementRef.children[0] as HTMLElement;
    if (!iconContainerElement.classList.contains('text-button')) {
      Object.assign(iconContainerElement.style, styles?.iconContainer);
    }
  }

  private changeToDefault(override?: boolean) {
    if (!override && this._state === 'default') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.default as Required<CustomDropupItemStateStyles>);
      this.elementRef.classList.remove(DropupItem.DISABLED_ITEM_CLASS, DropupItem.ACTIVE_ITEM_CLASS);
    } else {
      this.elementRef.replaceChildren(this._innerElements.default);
      if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
      if (this._customStyles?.disabled) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.disabled);
      this.reapplyStateStyle('default', ['active', 'disabled']);
    }
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'default';
  }

  private changeToActive(override?: boolean) {
    if (!override && this._state === 'active') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.active as Required<CustomDropupItemStateStyles>);
      this.elementRef.classList.remove(DropupItem.DISABLED_ITEM_CLASS);
      this.elementRef.classList.add(DropupItem.ACTIVE_ITEM_CLASS);
    } else {
      this.elementRef.replaceChildren(this._innerElements.active);
      this.reapplyStateStyle('active', ['disabled', 'default']);
    }
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'active';
  }

  private changeToDisabled(override?: boolean) {
    if (!override && this._state === 'disabled') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.disabled as Required<CustomDropupItemStateStyles>);
      this.elementRef.classList.remove(DropupItem.ACTIVE_ITEM_CLASS);
      this.elementRef.classList.add(DropupItem.DISABLED_ITEM_CLASS);
    } else {
      this.elementRef.replaceChildren(this._innerElements.disabled);
      if (this._customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.active);
      if (this._customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this._customStyles?.default);
      this.reapplyStateStyle('disabled', ['default', 'active']);
    }
    ButtonAccessibility.addAriaDisabled(this.elementRef);
    this._state = 'disabled';
  }

  public setDropupItem(dropupItem: HTMLElement) {
    this.elementRef = dropupItem;
    this._originalElementRef = dropupItem.cloneNode(true) as HTMLElement;
    this.changeState(this._state, true);
  }
}
