import {TEXT} from '../../../../utils/consts/messageConstants';
import {SVG} from '../../../../utils/consts/inputConstants';

export class ButtonUtils {
  public static parseSVGTextElements(elements: Element[]) {
    return {
      [SVG]: elements.find((element) => element.tagName.toLowerCase() === SVG),
      [TEXT]: elements.find((element) => element.tagName.toLowerCase() === 'div'),
    };
  }
}
