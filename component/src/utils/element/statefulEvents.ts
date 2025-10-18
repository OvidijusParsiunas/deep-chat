import {CLICK, DEFAULT, HOVER} from '../consts/inputConstants';
import {StatefulStyles} from '../../types/styles';
import {STYLE} from '../consts/htmlConstants';
import {StyleUtils} from './styleUtils';

export class StatefulEvents {
  private static mouseUp(element: HTMLElement, styles: StatefulStyles) {
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element[STYLE], styles[DEFAULT]);
    Object.assign(element[STYLE], styles[HOVER]);
  }

  private static mouseDown(element: HTMLElement, styles: StatefulStyles) {
    Object.assign(element[STYLE], styles[CLICK]);
  }

  private static mouseLeave(element: HTMLElement, styles: StatefulStyles) {
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element[STYLE], styles[DEFAULT]);
  }

  private static mouseEnter(element: HTMLElement, styles: StatefulStyles) {
    Object.assign(element[STYLE], styles[HOVER]);
  }

  public static add(element: HTMLElement, styles: StatefulStyles) {
    element.addEventListener('mouseenter', StatefulEvents.mouseEnter.bind(this, element, styles));
    element.addEventListener('mouseleave', StatefulEvents.mouseLeave.bind(this, element, styles));
    element.addEventListener('mousedown', StatefulEvents.mouseDown.bind(this, element, styles));
    element.addEventListener('mouseup', StatefulEvents.mouseUp.bind(this, element, styles));
  }
}
