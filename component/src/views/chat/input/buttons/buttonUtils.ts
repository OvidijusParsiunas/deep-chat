import {TEXT_KEY} from '../../../../utils/consts/messageConstants';

export class ButtonUtils {
  public static parseSVGTextElements(elements: Element[]) {
    return {
      svg: elements.find((element) => element.tagName.toLowerCase() === 'svg'),
      [TEXT_KEY]: elements.find((element) => element.tagName.toLowerCase() === 'div'),
    };
  }
}
