import {StyleUtils} from '../../../../utils/element/styleUtils';
import {StatefulStyles} from '../../../../types/styles';
import {ButtonStyles} from '../../../../types/button';
import {ButtonUtils} from './buttonUtils';

export class ButtonCSS {
  public static unsetAllCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetAllCSSMouseStates(button, styles.container);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (styles.svg?.styles && svg) StyleUtils.unsetAllCSSMouseStates(svg as HTMLElement, styles.svg.styles);
    if (styles.text?.styles && text) StyleUtils.unsetAllCSSMouseStates(text as HTMLElement, styles.text.styles);
  }

  public static unsetActionCSS(button: HTMLElement, styles: ButtonStyles) {
    if (styles.container) StyleUtils.unsetActivityCSSMouseStates(button, styles.container);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (styles.svg?.styles && svg) StyleUtils.unsetActivityCSSMouseStates(svg as HTMLElement, styles.svg.styles);
    if (styles.text?.styles && text) StyleUtils.unsetActivityCSSMouseStates(text as HTMLElement, styles.text.styles);
  }

  public static setElementsCSS(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    Object.assign(button.style, styles.container?.[style]);
    const {svg, text} = ButtonUtils.parseSVGTextElements(Array.from(button.children));
    if (svg) Object.assign((svg as HTMLElement).style, styles.svg?.styles?.[style]);
    if (text) Object.assign((text as HTMLElement).style, styles.text?.styles?.[style]);
  }

  public static setElementCssUpToState(button: HTMLElement, styles: ButtonStyles, style: keyof StatefulStyles) {
    ButtonCSS.setElementsCSS(button, styles, 'default');
    if (style === 'default') return;
    ButtonCSS.setElementsCSS(button, styles, 'hover');
    if (style === 'hover') return;
    ButtonCSS.setElementsCSS(button, styles, 'click');
  }
}
