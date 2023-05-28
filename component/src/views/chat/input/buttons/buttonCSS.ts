import {StyleUtils} from '../../../../utils/element/styleUtils';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonStyles} from '../../../../types/button';

export class ButtonCSS {
  public static unsetAllCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetAllCSSMouseStates(button, styles.container);
    if (styles.svg?.styles) StyleUtils.unsetAllCSSMouseStates(button.children[0] as HTMLElement, styles.svg.styles);
    if (styles.text?.styles) StyleUtils.unsetAllCSSMouseStates(button.children[0] as HTMLElement, styles.text.styles);
  }

  public static unsetActionCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetActivityCSSMouseStates(button, styles.container);
    if (styles.svg?.styles) StyleUtils.unsetActivityCSSMouseStates(button.children[0] as HTMLElement, styles.svg.styles);
    if (styles.text?.styles) StyleUtils.unsetActivityCSSMouseStates(button.children[0] as HTMLElement, styles.text.styles);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    Object.assign(button.style, styles.container?.[style]);
    Object.assign((button.children[0] as HTMLElement).style, styles.svg?.styles?.[style]);
    Object.assign((button.children[0] as HTMLElement).style, styles.text?.styles?.[style]);
  }

  public static setElementCssUpToState(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    ButtonCSS.setElementsCSS(button, styles, 'default');
    if (style === 'default') return;
    ButtonCSS.setElementsCSS(button, styles, 'hover');
    if (style === 'hover') return;
    ButtonCSS.setElementsCSS(button, styles, 'click');
  }
}
