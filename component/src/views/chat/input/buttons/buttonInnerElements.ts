import {ButtonInnerElement, ButtonStateStyles} from '../../../../types/buttonInternal';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';

export class ButtonInnerElements {
  private static readonly INPUT_BUTTON_SVG_CLASS = 'input-button-svg';
  private static readonly INPUT_BUTTON_SVG_TEXT_CLASS = 'input-button-svg-text';
  public static readonly INPUT_BUTTON_INNER_TEXT_CLASS = 'text-button';

  private static createTextElement(text: string) {
    const textElement = document.createElement('div');
    textElement.classList.add(ButtonInnerElements.INPUT_BUTTON_INNER_TEXT_CLASS);
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
    const text = stateStyle?.text?.content;
    const svg = stateStyle?.svg?.content;
    const elements: ButtonInnerElement[] = [];
    ButtonInnerElements.tryAddSVGElement(elements, base, svg, text);
    if (text) elements.push(ButtonInnerElements.createTextElement(text));
    return elements.length > 0 ? elements : undefined;
  }

  public static reassignClassBasedOnChildren(parentEl: HTMLElement, elements: ButtonInnerElement[]) {
    parentEl.classList.remove(ButtonInnerElements.INPUT_BUTTON_SVG_CLASS, ButtonInnerElements.INPUT_BUTTON_SVG_TEXT_CLASS);
    if (!elements.find((element) => element.classList.contains(ButtonInnerElements.INPUT_BUTTON_INNER_TEXT_CLASS))) {
      parentEl.classList.add(ButtonInnerElements.INPUT_BUTTON_SVG_CLASS);
    } else if (elements.length > 1) {
      parentEl.classList.add(ButtonInnerElements.INPUT_BUTTON_SVG_TEXT_CLASS);
    }
  }

  // https://github.com/OvidijusParsiunas/deep-chat/issues/175
  // isDropup here is only determined by the user and not when moved to dropup automatically
  // prettier-ignore
  public static createInnerElements<T>(parentEl: HTMLElement, iconId: string, 
      baseButton: SVGGraphicsElement, state: keyof T, customStyles?: ButtonStateStyles<T>, isDropup = false) {
    // if the destination is specified to be dropup and content is not defined - use baseButton
    if (isDropup && !customStyles?.[state]?.svg?.content) {
      baseButton.id = iconId;
      return [baseButton];
    }
    const elements = ButtonInnerElements.createCustomElements(state, baseButton, customStyles);
    if (elements) {
      ButtonInnerElements.reassignClassBasedOnChildren(parentEl, elements);
      return elements;
    }
    baseButton.id = iconId;
    return [baseButton];
  }
}
