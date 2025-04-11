import {DefinedButtonInnerElements, DefinedButtonStateStyles} from '../../../../../types/buttonInternal';
import {StatefulEvents} from '../../../../../utils/element/statefulEvents';
import {DropupMenuStyles} from '../../../../../types/dropupStyles';
import {SUBMIT_ICON_STRING} from '../../../../../icons/submitIcon';
import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {CustomButtonDropupStyle} from './customButtonDropupStyle';
import {HTMLUtils} from '../../../messages/html/htmlUtils';
import {ButtonAccessibility} from '../buttonAccessility';
import {ButtonStyles} from '../../../../../types/button';
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
  private readonly _menuStyles?: DropupMenuStyles;

  constructor(customButton: CustomButtonT, index: number, menuStyles?: DropupMenuStyles) {
    const dropupText = customButton?.styles?.button?.default?.text?.content || `Custom ${index}`;
    const svg = SUBMIT_ICON_STRING;
    super(CustomButton.createButtonElement(), svg, customButton?.position, customButton?.styles?.button, dropupText);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this._menuStyles = menuStyles;
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

  private createInnerElementsForStates(customStyles?: Styles) {
    const iconId = 'submit-icon';
    return {
      default: this.createInnerElements(iconId, 'default', customStyles),
      active: this.createInnerElements(iconId, 'active', customStyles),
      disabled: this.createInnerElements(iconId, 'disabled', customStyles),
    };
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

  private applyContentStyles(styles?: CustomDropupItemStateStyles) {
    const childrenEls = Array.from(this.elementRef.children);
    if (styles?.text) {
      const textElement = childrenEls.find((element) => element.classList.contains(DropupItem.TEXT_CLASS)) as HTMLElement;
      if (textElement) Object.assign(textElement.style, styles.text);
    }
    if (styles?.iconContainer) {
      const iconElement = childrenEls.find((element) => element.classList.contains(DropupItem.ICON_CLASS)) as HTMLElement;
      if (iconElement) Object.assign(iconElement.style, styles.iconContainer);
    }
  }

  private resetDropupItem(buttonStyles?: ButtonStyles) {
    // replacing item to reapply event listeners in stateful events
    this.elementRef = HTMLUtils.replaceElementWithNewClone(this.elementRef, this._originalElementRef);
    this.elementRef.innerHTML = '';
    const emptySVG = buttonStyles?.svg?.content === '';
    if (!emptySVG) this.elementRef.appendChild(DropupItem.createItemIcon(this.svg, this._menuStyles?.iconContainer));
    this.elementRef.appendChild(DropupItem.createItemText(this.dropupText, this._menuStyles?.text));
  }

  private assignDropupItemStyle(dropupStyles?: CustomDropupItemStateStyles, buttonStyles?: ButtonStyles) {
    // doesn't have a parent element when inserted at the start
    if (this.elementRef.parentElement && this._originalElementRef) this.resetDropupItem(buttonStyles);
    this.applyContentStyles(dropupStyles);
    Object.assign(this.elementRef.style, dropupStyles?.item?.default);
    const statefulStyles = StyleUtils.processStateful(dropupStyles?.item || {});
    StatefulEvents.add(this.elementRef, statefulStyles);
    this.addClickListener();
  }

  private changeToDefault(override?: boolean) {
    if (!override && this._state === 'default') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.default, this.customStyles?.default);
      this.elementRef.classList.remove(DropupItem.DISABLED_ITEM_CLASS, DropupItem.ACTIVE_ITEM_CLASS);
    } else {
      this.changeElementsByState(this._innerElements.default);
      if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
      if (this.customStyles?.disabled) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.disabled);
      this.reapplyStateStyle('default', ['active', 'disabled']);
    }
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'default';
  }

  private changeToActive(override?: boolean) {
    if (!override && this._state === 'active') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.active, this.customStyles?.active);
      this.elementRef.classList.remove(DropupItem.DISABLED_ITEM_CLASS);
      this.elementRef.classList.add(DropupItem.ACTIVE_ITEM_CLASS);
    } else {
      this.changeElementsByState(this._innerElements.active);
      this.reapplyStateStyle('active', ['disabled', 'default']);
    }
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'active';
  }

  private changeToDisabled(override?: boolean) {
    if (!override && this._state === 'disabled') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles.disabled, this.customStyles?.disabled);
      this.elementRef.classList.remove(DropupItem.ACTIVE_ITEM_CLASS);
      this.elementRef.classList.add(DropupItem.DISABLED_ITEM_CLASS);
    } else {
      this.changeElementsByState(this._innerElements.disabled);
      if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
      if (this.customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.default);
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
