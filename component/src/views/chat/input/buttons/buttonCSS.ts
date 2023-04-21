import {StyleUtils} from '../../../../utils/element/styleUtils';
import {ButtonElementStyles} from '../../../../types/button';
import {StatefulStyles} from '../../../../types/styles';

export class ButtonCSS {
  public static unsetAllCSS(button: HTMLElement, styles: ButtonElementStyles) {
    if (styles.container) StyleUtils.unsetAllCSSMouseStates(button, styles.container);
    if (styles.svg?.styles) StyleUtils.unsetAllCSSMouseStates(button.children[0] as HTMLElement, styles.svg.styles);
  }

  public static unsetActionCSS(button: HTMLElement, styles: ButtonElementStyles) {
    if (styles.container) StyleUtils.unsetActivityCSSMouseStates(button, styles.container);
    if (styles.svg?.styles) StyleUtils.unsetActivityCSSMouseStates(button.children[0] as HTMLElement, styles.svg.styles);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonElementStyles, style: keyof StatefulStyles) {
    Object.assign(button.style, styles.container?.[style]);
    Object.assign((button.children[0] as HTMLElement).style, styles.svg?.styles?.[style]);
  }

  public static setElementCssUpToState(button: HTMLElement, styles: ButtonElementStyles, style: keyof StatefulStyles) {
    ButtonCSS.setElementsCSS(button, styles, 'default');
    if (style === 'default') return;
    ButtonCSS.setElementsCSS(button, styles, 'hover');
    if (style === 'hover') return;
    ButtonCSS.setElementsCSS(button, styles, 'click');
    return;
  }
}
