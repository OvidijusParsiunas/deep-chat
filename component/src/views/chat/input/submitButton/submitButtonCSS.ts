import {SubmitButtonElementsStyle} from '../../../../types/submitButton';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {StatefulStyle} from '../../../../types/styles';

export class SubmitButtonCSS {
  public static unsetButtonElementAllCSS(button: HTMLElement, styles: SubmitButtonElementsStyle) {
    if (styles.container) StyleUtils.unsetAllCSSStates(button, styles.container);
    if (styles.svg?.style) StyleUtils.unsetAllCSSStates(button.children[0] as HTMLElement, styles.svg.style);
  }

  public static setElementsCSS(button: HTMLElement, styles: SubmitButtonElementsStyle, style: keyof StatefulStyle) {
    Object.assign(button.style, styles.container?.[style]);
    Object.assign((button.children[0] as HTMLElement).style, styles.svg?.style?.[style]);
  }
}
