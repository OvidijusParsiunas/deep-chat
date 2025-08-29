import {StatefulStyles} from '../../types/styles';
import {StyleUtils} from './styleUtils';

export class StatefulEvents {
  private static mouseUp(element: HTMLElement, styles: StatefulStyles) {
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element.style, styles.default);
    Object.assign(element.style, styles.hover);
  }

  private static mouseDown(element: HTMLElement, styles: StatefulStyles) {
    Object.assign(element.style, styles.click);
  }

  private static mouseLeave(element: HTMLElement, styles: StatefulStyles) {
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element.style, styles.default);
  }

  private static mouseEnter(element: HTMLElement, styles: StatefulStyles) {
    Object.assign(element.style, styles.hover);
  }

  public static add(element: HTMLElement, styles: StatefulStyles) {
    element.addEventListener('mouseenter', StatefulEvents.mouseEnter.bind(this, element, styles));
    element.addEventListener('mouseleave', StatefulEvents.mouseLeave.bind(this, element, styles));
    element.addEventListener('mousedown', StatefulEvents.mouseDown.bind(this, element, styles));
    element.addEventListener('mouseup', StatefulEvents.mouseUp.bind(this, element, styles));
  }
}
