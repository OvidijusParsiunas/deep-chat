import {ButtonElementStyles} from '../../../../types/button';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonCSS} from './buttonCSS';

interface MouseState {
  state: keyof StatefulStyles;
}

export class ButtonStyleEvents<T extends {[key: string]: ButtonElementStyles}> {
  readonly elementRef: HTMLElement;
  protected readonly _mouseState: MouseState = {state: 'default'};
  protected readonly _customStyles?: T;

  constructor(buttonElement: HTMLElement, customStyles?: T) {
    this.elementRef = buttonElement;
    this._customStyles = customStyles;
  }
  private buttonMouseLeave(customStyles?: ButtonElementStyles) {
    this._mouseState.state = 'default';
    if (customStyles) {
      ButtonCSS.unsetAllCSS(this.elementRef, customStyles);
      ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'default');
    }
  }

  private buttonMouseEnter(customStyles?: ButtonElementStyles) {
    this._mouseState.state = 'hover';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'hover');
  }

  private buttonMouseDown(customStyles?: ButtonElementStyles) {
    this._mouseState.state = 'click';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'click');
  }

  // be careful not to use onclick as that is used for button functionality
  private setEvents(customStyles?: ButtonElementStyles) {
    this.elementRef.onmousedown = this.buttonMouseDown.bind(this, customStyles);
    this.elementRef.onmouseup = this.buttonMouseEnter.bind(this, customStyles);
    this.elementRef.onmouseenter = this.buttonMouseEnter.bind(this, customStyles);
    this.elementRef.onmouseleave = this.buttonMouseLeave.bind(this, customStyles);
  }

  public unsetFirstAvailableStateStyle(unsetTypes: (keyof T)[]) {
    if (!this._customStyles) return;
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && this._customStyles[type];
      if (style) ButtonCSS.unsetAllCSS(this.elementRef, style);
    }
  }

  public reapplyStateStyle(setType: keyof T, unsetTypes?: (keyof T)[]) {
    if (!this._customStyles) return;
    if (unsetTypes) this.unsetFirstAvailableStateStyle(unsetTypes);
    const setStyle = this._customStyles[setType];
    if (setStyle) ButtonCSS.setElementCssUpToState(this.elementRef, setStyle, this._mouseState.state);
    this.setEvents(setStyle);
  }
}
