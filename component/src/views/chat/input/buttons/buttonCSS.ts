import {CLICK, DEFAULT, HOVER, SVG} from '../../../../utils/consts/inputConstants';
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
    if (styles[SVG]?.styles && svg) StyleUtils.unsetAllCSSMouseStates(svg as HTMLElement, styles[SVG].styles);
    if (styles[TEXT]?.styles && text) StyleUtils.unsetAllCSSMouseStates(text as HTMLElement, styles[TEXT].styles);
  }

  public static unsetActionCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetActivityCSSMouseStates(button, styles.container);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (styles[SVG]?.styles && svg) StyleUtils.unsetActivityCSSMouseStates(svg as HTMLElement, styles[SVG].styles);
    if (styles[TEXT]?.styles && text) StyleUtils.unsetActivityCSSMouseStates(text as HTMLElement, styles[TEXT].styles);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    Object.assign(button[STYLE], styles.container?.[style]);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (svg) Object.assign((svg as HTMLElement)[STYLE], styles[SVG]?.styles?.[style]);
    if (text) Object.assign((text as HTMLElement)[STYLE], styles[TEXT]?.styles?.[style]);
  }

  public static setElementCssUpToState(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    ButtonCSS.setElementsCSS(button, styles, DEFAULT);
    if (style === DEFAULT) return;
    ButtonCSS.setElementsCSS(button, styles, HOVER);
    if (style === HOVER) return;
    ButtonCSS.setElementsCSS(button, styles, CLICK);
  }
}
