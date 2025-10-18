import {TEXT} from '../../../../utils/consts/messageConstants';

export class ButtonUtils {
  public static parseSVGTextElements(elements: Element[]) {
    return {
      svg: elements.find((element) => element.tagName.toLowerCase() === 'svg'),
      [TEXT]: elements.find((element) => element.tagName.toLowerCase() === 'div'),
    };
  }
}
