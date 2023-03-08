import {StyleUtils} from '../../../../utils/element/styleUtils';
import {ButtonElementStyles} from '../../../../types/button';
import {StatefulStyle} from '../../../../types/styles';

export class ButtonCSS {
  public static unsetAllCSS(button: HTMLElement, styles: ButtonElementStyles) {
    if (styles.container) StyleUtils.unsetAllCSSStates(button, styles.container);
    if (styles.svg?.style) StyleUtils.unsetAllCSSStates(button.children[0] as HTMLElement, styles.svg.style);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonElementStyles, style: keyof StatefulStyle) {
    Object.assign(button.style, styles.container?.[style]);
    Object.assign((button.children[0] as HTMLElement).style, styles.svg?.style?.[style]);
  }
}
