import {ButtonElementStyles} from '../../../../types/button';
import {StatefulStyle} from '../../../../types/styles';
import {ButtonCSS} from './buttonCSS';

interface MouseState {
  state: keyof StatefulStyle;
}

export class ButtonStyleEvents<T> {
  readonly elementRef: HTMLElement;
  protected readonly _mouseState: MouseState = {state: 'default'};
  protected readonly _customStyles?: T;

  constructor(buttonElement: HTMLElement, customStyles: T) {
    this.elementRef = buttonElement;
    this._customStyles = customStyles;
  }
  private buttonMouseLeave(customStyles: ButtonElementStyles) {
    ButtonCSS.unsetAllCSS(this.elementRef, customStyles);
    ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'default');
    this._mouseState.state = 'default';
  }

  private buttonMouseEnter(customStyles: ButtonElementStyles) {
    ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'hover');
    this._mouseState.state = 'hover';
  }

  private buttonMouseDown(customStyles: ButtonElementStyles) {
    ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'click');
    this._mouseState.state = 'click';
  }

  private setEvents(customStyles: ButtonElementStyles) {
    this.elementRef.onmousedown = this.buttonMouseDown.bind(this, customStyles);
    this.elementRef.onmouseenter = this.buttonMouseEnter.bind(this, customStyles);
    this.elementRef.onmouseleave = this.buttonMouseLeave.bind(this, customStyles);
  }

  private unsetEvents() {
    this.elementRef.onmousedown = () => {};
    this.elementRef.onmouseenter = () => {};
    this.elementRef.onmouseleave = () => {};
  }

  public unsetFirstAvailableStateStyle(unsetTypes: (keyof T)[]) {
    if (!this._customStyles) return;
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && this._customStyles[type];
      if (style) ButtonCSS.unsetAllCSS(this.elementRef, style);
    }
  }

  public reapplyStateStyle(isFirst: boolean, setType: keyof T, unsetTypes?: (keyof T)[]) {
    if (!this._customStyles) return;
    if (unsetTypes) this.unsetFirstAvailableStateStyle(unsetTypes);
    const setStyle = this._customStyles[setType];
    if (setStyle) {
      ButtonCSS.setElementsCSS(this.elementRef, setStyle, this._mouseState.state);
      this.setEvents(setStyle);
    } else if (isFirst) {
      this.unsetEvents();
    }
  }
}
