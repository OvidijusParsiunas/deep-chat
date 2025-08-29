import {StatefulEvents} from '../../../../../utils/element/statefulEvents';
import {DropupMenuStyles} from '../../../../../types/dropupStyles';
import {CUSTOM_ICON_STRING} from '../../../../../icons/customIcon';
import {StyleUtils} from '../../../../../utils/element/styleUtils';
import {HTMLUtils} from '../../../messages/html/htmlUtils';
import {ButtonAccessibility} from '../buttonAccessility';
import {ButtonStyles} from '../../../../../types/button';
import {TooltipUtils} from '../tooltip/tooltipUtils';
import {DropupItem} from '../../dropup/dropupItem';
import {DeepChat} from '../../../../../deepChat';
import {InputButton} from '../inputButton';
import {ButtonUtils} from '../buttonUtils';
import {ButtonCSS} from '../buttonCSS';
import {Buttons} from '../../input';
import {
  DefinedButtonInnerElements,
  DefinedButtonStateStyles,
  ButtonInnerElement,
} from '../../../../../types/buttonInternal';
import {
  CustomButton as CustomButtonT,
  CustomDropupItemStateStyles,
  CustomDropupItemStyles,
  CustomButtonStyles,
} from '../../../../../types/customButton';

type Styles = DefinedButtonStateStyles<CustomButtonStyles>;

export type CustomButtonDropupStyles = Pick<CustomDropupItemStyles, 'default' | 'active' | 'disabled'>;

export class CustomButton extends InputButton<Styles> {
  public static readonly INDICATOR_PREFIX = 'custom';
  public static readonly BUTTON_CLASS = 'custom-button';
  public static readonly DISABLED_CONTAINER_CLASS = 'custom-button-container-disabled';
  private static readonly DEFAULT_CONTAINER_CLASS = 'custom-button-container-default';
  private static readonly ACTIVE_CONTAINER_CLASS = 'custom-button-container-active';
  private readonly _innerElements: DefinedButtonInnerElements<Styles>;
  private _originalElementRef: HTMLElement | undefined; // currently used only for dropup items
  private _state: keyof CustomButtonStyles = 'default';
  private readonly _onClick: CustomButtonT['onClick'];
  private readonly _dropupStyles?: CustomDropupItemStyles;
  private readonly _menuStyles?: DropupMenuStyles;
  override isCustom = true;

  // prettier-ignore
  constructor(customButton: CustomButtonT, index: number, focusInput?: () => void, menuStyles?: DropupMenuStyles) {
    const dropupText = customButton?.styles?.button?.default?.text?.content || `Custom ${index}`;
    const svg = CUSTOM_ICON_STRING;
    const tooltip = TooltipUtils.tryCreateConfig(`Custom ${index}`, customButton?.tooltip);  
    super(CustomButton.createButtonElement(), svg, customButton?.position,
      tooltip, customButton?.styles?.button || (tooltip && {}), dropupText);
    this._innerElements = this.createInnerElementsForStates(this.customStyles);
    this._menuStyles = menuStyles;
    this._onClick = customButton.onClick;
    this._dropupStyles = customButton.styles?.dropup;
    this.setSetState(customButton);
    this.addClickListener(focusInput);
    this.changeState(customButton.initialState, true);
  }

  private static createButtonElement() {
    const buttonElement = document.createElement('div');
    buttonElement.classList.add('input-button', CustomButton.BUTTON_CLASS);
    return buttonElement;
  }

  private createInnerElementsForStates(customStyles?: Styles) {
    const iconId = 'custom-icon';
    const defaultElements = this.createInnerElements(iconId, 'default', customStyles);
    return {
      default: defaultElements,
      active: this.genStateInnerElements(iconId, 'active', defaultElements, customStyles),
      disabled: this.genStateInnerElements(iconId, 'disabled', defaultElements, customStyles),
    };
  }

  private setSetState(customButton: CustomButtonT) {
    customButton.setState = (state: keyof CustomButtonStyles) => {
      if (state === 'default') this.changeToDefault();
      if (state === 'active') this.changeToActive();
      if (state === 'disabled') this.changeToDisabled();
    };
  }

  private addClickListener(focusInput?: () => void) {
    this.elementRef.addEventListener('click', () => {
      const resultState = this._onClick?.(this._state);
      focusInput?.();
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

  private applyDropupContentStyles(styles?: CustomDropupItemStateStyles) {
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
    this.applyDropupContentStyles(dropupStyles);
    Object.assign(this.elementRef.style, dropupStyles?.item?.default);
    const statefulStyles = StyleUtils.processStateful(dropupStyles?.item || {});
    StatefulEvents.add(this.elementRef, statefulStyles);
    this.addClickListener();
  }

  private changeToDefault(override?: boolean) {
    if (!override && this._state === 'default') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles?.default, this.customStyles?.default);
    } else {
      this.changeElementsByState(this._innerElements.default);
      if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
      if (this.customStyles?.disabled) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.disabled);
      this.reapplyStateStyle('default', ['active', 'disabled']);
    }
    this.elementRef.classList.remove(CustomButton.DISABLED_CONTAINER_CLASS, CustomButton.ACTIVE_CONTAINER_CLASS);
    this.elementRef.classList.add(CustomButton.DEFAULT_CONTAINER_CLASS);
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'default';
  }

  private changeToActive(override?: boolean) {
    if (!override && this._state === 'active') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles?.active, this.customStyles?.active);
    } else {
      this.changeElementsByState(this._innerElements.active);
      this.reapplyStateStyle('active', ['disabled', 'default']);
    }
    this.elementRef.classList.remove(CustomButton.DISABLED_CONTAINER_CLASS, CustomButton.DEFAULT_CONTAINER_CLASS);
    this.elementRef.classList.add(CustomButton.ACTIVE_CONTAINER_CLASS);
    ButtonAccessibility.removeAriaDisabled(this.elementRef);
    this._state = 'active';
  }

  private changeToDisabled(override?: boolean) {
    if (!override && this._state === 'disabled') return;
    if (this.elementRef.classList.contains(DropupItem.MENU_ITEM_CLASS)) {
      this.assignDropupItemStyle(this._dropupStyles?.disabled, this.customStyles?.disabled);
    } else {
      this.changeElementsByState(this._innerElements.disabled);
      if (this.customStyles?.active) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.active);
      if (this.customStyles?.default) ButtonCSS.unsetAllCSS(this.elementRef, this.customStyles?.default);
      this.reapplyStateStyle('disabled', ['default', 'active']);
    }
    this.elementRef.classList.remove(CustomButton.ACTIVE_CONTAINER_CLASS, CustomButton.DEFAULT_CONTAINER_CLASS);
    this.elementRef.classList.add(CustomButton.DISABLED_CONTAINER_CLASS);
    ButtonAccessibility.addAriaDisabled(this.elementRef);
    this._state = 'disabled';
  }

  // called after class is initialised
  public setDropupItem(dropupItem: HTMLElement) {
    this.elementRef = dropupItem;
    this._originalElementRef = dropupItem.cloneNode(true) as HTMLElement;
    this.changeState(this._state, true);
  }

  private genStateInnerElements(iconId: string, state: keyof Styles, defaultElements: Element[], customStyles?: Styles) {
    let stateElements = this.createInnerElements(iconId, state, customStyles);
    const SVGContent = customStyles?.[state]?.svg?.content;
    const textContent = customStyles?.[state]?.text?.content;
    if (SVGContent === undefined || textContent === undefined) {
      const {svg: defaultSVG, text: defaultText} = ButtonUtils.parseSVGTextElements(defaultElements);
      const {svg: stateSVG, text: stateText} = ButtonUtils.parseSVGTextElements(stateElements);
      const newElements: ButtonInnerElement[] = [];
      CustomButton.addToInnerElements(newElements, SVGContent, defaultSVG, stateSVG);
      CustomButton.addToInnerElements(newElements, textContent, defaultText, stateText);
      stateElements = newElements;
    }
    return stateElements;
  }

  private static addToInnerElements(newEls: ButtonInnerElement[], content?: string, defEl?: Element, stateEl?: Element) {
    if (content === undefined && defEl) {
      newEls.push(defEl.cloneNode(true) as ButtonInnerElement);
    } else if (stateEl) {
      newEls.push(stateEl as ButtonInnerElement);
    }
  }

  public static add(deepChat: DeepChat, buttons: Buttons) {
    const {customButtons, focusInput, dropupStyles} = deepChat;
    customButtons?.forEach((customButton, index) => {
      const button = {button: new CustomButton(customButton, index + 1, focusInput, dropupStyles?.menu)};
      buttons[`${CustomButton.INDICATOR_PREFIX}${index + 1}`] = button;
    });
  }
}
