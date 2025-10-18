import {ButtonInnerElement, ButtonStateStyles} from '../../../../types/buttonInternal';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../utils/consts/htmlConstants';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';
import {TEXT} from '../../../../utils/consts/messageConstants';

export class ButtonInnerElements {
  private static readonly INPUT_BUTTON_SVG_TEXT_CLASS = 'input-button-svg-text';
  public static readonly INPUT_BUTTON_INNER_TEXT_CLASS = 'text-button';
  public static readonly INPUT_BUTTON_SVG_CLASS = 'input-button-svg';

  private static createTextElement(text: string) {
    const textElement = CREATE_ELEMENT();
    textElement[CLASS_LIST].add(ButtonInnerElements.INPUT_BUTTON_INNER_TEXT_CLASS);
    textElement.innerText = text;
    return textElement;
  }

  private static tryAddSVGElement(elements: ButtonInnerElement[], base: SVGGraphicsElement, svg?: string, text?: string) {
    // add svg element if custom or add a base svg only if svg string is not set to empty
    if (svg) {
      elements.push(SVGIconUtils.createSVGElement(svg));
    } else if (svg !== '' && text) {
      elements.push(base);
    }
  }

  public static createCustomElements<T>(state: keyof T, base: SVGGraphicsElement, customStyles?: ButtonStateStyles<T>) {
    const stateStyle = customStyles?.[state];
    const text = stateStyle?.[TEXT]?.content;
    const svg = stateStyle?.svg?.content;
    const elements: ButtonInnerElement[] = [];
    ButtonInnerElements.tryAddSVGElement(elements, base, svg, text);
    if (text) elements.push(ButtonInnerElements.createTextElement(text));
    return elements.length > 0 ? elements : undefined;
  }

  public static reassignClassBasedOnChildren(parentEl: HTMLElement, elements: ButtonInnerElement[]) {
    parentEl[CLASS_LIST].remove(
      ButtonInnerElements.INPUT_BUTTON_SVG_CLASS,
      ButtonInnerElements.INPUT_BUTTON_SVG_TEXT_CLASS
    );
    if (!elements.find((element) => element[CLASS_LIST].contains(ButtonInnerElements.INPUT_BUTTON_INNER_TEXT_CLASS))) {
      parentEl[CLASS_LIST].add(ButtonInnerElements.INPUT_BUTTON_SVG_CLASS);
    } else if (elements.length > 1) {
      parentEl[CLASS_LIST].add(ButtonInnerElements.INPUT_BUTTON_SVG_TEXT_CLASS);
    }
  }
}
