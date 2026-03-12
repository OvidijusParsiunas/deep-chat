import {CLICK, DEFAULT, HOVER, STYLES, SVG} from '../../../../utils/consts/inputConstants';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {TEXT} from '../../../../utils/consts/messageConstants';
import {STYLE} from '../../../../utils/consts/htmlConstants';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonStyles} from '../../../../types/button';
import {ButtonUtils} from './buttonUtils';

export class ButtonCSS {
  public static unsetAllCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetAllCSSMouseStates(button, styles.container);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (styles[SVG]?.[STYLES] && svg) StyleUtils.unsetAllCSSMouseStates(svg as HTMLElement, styles[SVG][STYLES]);
    if (styles[TEXT]?.[STYLES] && text) StyleUtils.unsetAllCSSMouseStates(text as HTMLElement, styles[TEXT][STYLES]);
  }

  public static unsetActionCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetActivityCSSMouseStates(button, styles.container);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (styles[SVG]?.[STYLES] && svg) StyleUtils.unsetActivityCSSMouseStates(svg as HTMLElement, styles[SVG][STYLES]);
    if (styles[TEXT]?.[STYLES] && text) StyleUtils.unsetActivityCSSMouseStates(text as HTMLElement, styles[TEXT][STYLES]);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    Object.assign(button[STYLE], styles.container?.[style]);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (svg) Object.assign((svg as HTMLElement)[STYLE], styles[SVG]?.[STYLES]?.[style]);
    if (text) Object.assign((text as HTMLElement)[STYLE], styles[TEXT]?.[STYLES]?.[style]);
  }

  public static setElementCssUpToState(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    ButtonCSS.setElementsCSS(button, styles, DEFAULT);
    if (style === DEFAULT) return;
    ButtonCSS.setElementsCSS(button, styles, HOVER);
    if (style === HOVER) return;
    ButtonCSS.setElementsCSS(button, styles, CLICK);
  }
}
