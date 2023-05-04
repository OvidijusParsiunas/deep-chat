import {StatefulStyles} from '../../types/styles';
import {StyleUtils} from './styleUtils';

export class StatefulEvents {
  private static mouseUp(styles: StatefulStyles, event: MouseEvent) {
    const element = event.target as HTMLElement;
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element.style, styles.default);
    Object.assign(element.style, styles.hover);
  }

  private static mouseDown(styles: StatefulStyles, event: MouseEvent) {
    const element = event.target as HTMLElement;
    Object.assign(element.style, styles.click);
  }

  private static mouseLeave(styles: StatefulStyles, event: MouseEvent) {
    const element = event.target as HTMLElement;
    StyleUtils.unsetAllCSSMouseStates(element, styles);
    Object.assign(element.style, styles.default);
  }

  private static mouseEnter(styles: StatefulStyles, event: MouseEvent) {
    const element = event.target as HTMLElement;
    Object.assign(element.style, styles.hover);
  }

  // note that children elements can not be selectable
  public static add(element: HTMLElement, styles: StatefulStyles) {
    element.addEventListener('mouseenter', StatefulEvents.mouseEnter.bind(this, styles));
    element.addEventListener('mouseleave', StatefulEvents.mouseLeave.bind(this, styles));
    element.addEventListener('mousedown', StatefulEvents.mouseDown.bind(this, styles));
    element.addEventListener('mouseup', StatefulEvents.mouseUp.bind(this, styles));
  }
}
