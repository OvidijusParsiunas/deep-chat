import {ButtonPosition as ButtonPositionT} from '../../../../types/button';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonStyles} from '../../../../types/button';
import {ButtonCSS} from './buttonCSS';

interface MouseState {
  state: keyof StatefulStyles;
}

export class InputButton<T extends {[key: string]: ButtonStyles} = {}> {
  readonly elementRef: HTMLElement;
  protected readonly _mouseState: MouseState = {state: 'default'};
  protected readonly _customStyles?: T;
  readonly position?: ButtonPositionT;
  readonly dropupText?: string;

  constructor(buttonElement: HTMLElement, position?: ButtonPositionT, customStyles?: T, dropupText?: string) {
    this.elementRef = buttonElement;
    this._customStyles = customStyles;
    this.position = position;
    this.dropupText = dropupText;
  }

  private buttonMouseLeave(customStyles?: ButtonStyles) {
    this._mouseState.state = 'default';
    if (customStyles) {
      ButtonCSS.unsetAllCSS(this.elementRef, customStyles);
      ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'default');
    }
  }

  private buttonMouseEnter(customStyles?: ButtonStyles) {
    this._mouseState.state = 'hover';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'hover');
  }

  private buttonMouseUp(customStyles?: ButtonStyles) {
    if (customStyles) ButtonCSS.unsetActionCSS(this.elementRef, customStyles);
    this.buttonMouseEnter(customStyles);
  }

  private buttonMouseDown(customStyles?: ButtonStyles) {
    this._mouseState.state = 'click';
    if (customStyles) ButtonCSS.setElementsCSS(this.elementRef, customStyles, 'click');
  }

  // be careful not to use onclick as that is used for button functionality
  private setEvents(customStyles?: ButtonStyles) {
    this.elementRef.onmousedown = this.buttonMouseDown.bind(this, customStyles);
    this.elementRef.onmouseup = this.buttonMouseUp.bind(this, customStyles);
    this.elementRef.onmouseenter = this.buttonMouseEnter.bind(this, customStyles);
    this.elementRef.onmouseleave = this.buttonMouseLeave.bind(this, customStyles);
  }

  public unsetCustomStateStyles(unsetTypes: (keyof T)[]) {
    if (!this._customStyles) return;
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && this._customStyles[type];
      if (style) ButtonCSS.unsetActionCSS(this.elementRef, style);
    }
  }

  public reapplyStateStyle(setType: keyof T, unsetTypes?: (keyof T)[]) {
    if (!this._customStyles) return;
    if (unsetTypes) this.unsetCustomStateStyles(unsetTypes);
    const setStyle = this._customStyles[setType];
    if (setStyle) ButtonCSS.setElementCssUpToState(this.elementRef, setStyle, this._mouseState.state);
    this.setEvents(setStyle);
  }
}
