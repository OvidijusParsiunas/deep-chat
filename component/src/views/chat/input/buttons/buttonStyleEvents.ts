import {SubmitButtonElStyles} from '../../../../types/submitButtonInternal';
import {ButtonStateStyles} from '../../../../types/buttonInternal';
import {ButtonElementStyles} from '../../../../types/button';
import {StatefulStyle} from '../../../../types/styles';
import {ButtonCSS} from './buttonCSS';

interface MouseState {
  state: keyof StatefulStyle;
}

export class ButtonStyleEvents {
  readonly elementRef: HTMLElement;
  protected readonly _mouseState: MouseState = {state: 'default'};
  protected readonly _customStyles?: ButtonStateStyles;

  constructor(buttonElement: HTMLElement, customStyles: ButtonStateStyles) {
    this.elementRef = buttonElement;
    this._customStyles = customStyles;
  }
  private buttonMouseLeave(button: HTMLElement, customStyles: ButtonElementStyles) {
    ButtonCSS.unsetAllCSS(button, customStyles);
    ButtonCSS.setElementsCSS(button, customStyles, 'default');
    this._mouseState.state = 'default';
  }

  private buttonMouseEnter(button: HTMLElement, customStyles: ButtonElementStyles) {
    ButtonCSS.setElementsCSS(button, customStyles, 'hover');
    this._mouseState.state = 'hover';
  }

  private buttonMouseDown(button: HTMLElement, customStyles: ButtonElementStyles) {
    ButtonCSS.setElementsCSS(button, customStyles, 'click');
    this._mouseState.state = 'click';
  }

  protected setEvents(button: HTMLElement, customStyles: ButtonElementStyles) {
    button.onmousedown = this.buttonMouseDown.bind(this, button, customStyles);
    button.onmouseenter = this.buttonMouseEnter.bind(this, button, customStyles);
    button.onmouseleave = this.buttonMouseLeave.bind(this, button, customStyles);
  }

  public unsetFirstAvailableStateStyle(unsetTypes: (keyof SubmitButtonElStyles)[]) {
    if (!this._customStyles) return;
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && this._customStyles[type];
      if (style) ButtonCSS.unsetAllCSS(this.elementRef, style);
    }
  }

  public reapplyStateStyle(setType: keyof SubmitButtonElStyles, unsetTypes?: (keyof SubmitButtonElStyles)[]) {
    if (!this._customStyles) return;
    const setStyle = this._customStyles[setType];
    if (setStyle) {
      if (unsetTypes) this.unsetFirstAvailableStateStyle(unsetTypes);
      ButtonCSS.setElementsCSS(this.elementRef, setStyle, this._mouseState.state);
      this.setEvents(this.elementRef, setStyle);
    }
  }
}
