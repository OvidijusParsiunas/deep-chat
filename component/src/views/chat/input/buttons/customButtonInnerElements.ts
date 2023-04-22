import {ButtonInnerElements, ButtonStateStyles} from '../../../../types/buttonInternal';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';

export class CustomButtonInnerElements {
  private static createTextElement(text: string) {
    const textElement = document.createElement('div');
    textElement.innerText = text;
    return textElement;
  }

  private static createElement(string: string, isText: boolean) {
    return isText ? CustomButtonInnerElements.createTextElement(string) : SVGIconUtils.createSVGElement(string);
  }

  private static createCustomElement<T>(customStyles: ButtonStateStyles<T>, state: keyof T) {
    const stateStyle = customStyles[state];
    if (stateStyle?.text?.content) return CustomButtonInnerElements.createElement(stateStyle?.text?.content, true);
    if (stateStyle?.svg?.content) return CustomButtonInnerElements.createElement(stateStyle?.svg?.content, false);
    return;
  }

  // publicly used for creating elements that do not change state in a sequence
  public static createSpecificStateElement<T>(state: keyof T, id: string, customStyles?: ButtonStateStyles<T>) {
    if (!customStyles) return;
    const element = CustomButtonInnerElements.createCustomElement(customStyles, state);
    // setting the id to have a base button style
    if (element) element.id = id;
    return element;
  }

  // used for creating elements that change state in a sequence
  public static create<T>(states: (keyof T)[], initId: string, styles?: ButtonStateStyles<T>): ButtonInnerElements<T> {
    const returnObj: ButtonInnerElements<T> = {};
    if (!styles) return returnObj;
    // if the user has specified element for any state, it will be reused for next states
    const initialStateEl = CustomButtonInnerElements.createSpecificStateElement<T>(states[0], initId, styles);
    returnObj[states[0]] = initialStateEl;
    let lastStateEl = initialStateEl;
    states.slice(1).forEach((state) => {
      lastStateEl = CustomButtonInnerElements.createCustomElement<T>(styles, state) || lastStateEl;
      returnObj[state] = lastStateEl;
    });
    return returnObj;
  }
}
