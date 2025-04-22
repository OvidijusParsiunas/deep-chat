export class ButtonUtils {
  public static parseSVGTextElements(elements: Element[]) {
    return {
      svg: elements.find((element) => element.tagName.toLowerCase() === 'svg'),
      text: elements.find((element) => element.tagName.toLowerCase() === 'div'),
    };
  }
}
