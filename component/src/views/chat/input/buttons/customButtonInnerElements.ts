import {ButtonStateStyles} from '../../../../types/buttonInternal';
import {SVGIconUtils} from '../../../../utils/svg/svgIconUtils';

export class CustomButtonInnerElements {
  private static createTextElement(text: string) {
    const textElement = document.createElement('div');
    textElement.classList.add('text-button');
    textElement.innerText = text;
    return textElement;
  }

  private static createElement(string: string, isText: boolean) {
    return isText ? CustomButtonInnerElements.createTextElement(string) : SVGIconUtils.createSVGElement(string);
  }

  public static createCustomElement<T>(state: keyof T, customStyles?: ButtonStateStyles<T>) {
    const stateStyle = customStyles?.[state];
    if (stateStyle?.svg?.content) return CustomButtonInnerElements.createElement(stateStyle?.svg?.content, false);
    if (stateStyle?.text?.content) return CustomButtonInnerElements.createElement(stateStyle?.text?.content, true);
    return;
  }

  private static processElement(parentEl: HTMLElement, element?: Element) {
    if (!element?.classList.contains('text-button')) {
      parentEl.classList.add('input-button-svg');
    }
  }

  // publicly used for creating elements that do not change state in a sequence
  // prettier-ignore
  public static createSpecificStateElement<T>(
      parentEl: HTMLElement, state: keyof T, customStyles?: ButtonStateStyles<T>) {
    let element: HTMLDivElement | SVGGraphicsElement | undefined;
    if (customStyles) element = CustomButtonInnerElements.createCustomElement(state, customStyles);
    CustomButtonInnerElements.processElement(parentEl, element);
    return element;
  }

  // https://github.com/OvidijusParsiunas/deep-chat/issues/175
  // isDropup here is only determined by the user and not when moved to dropup automatically
  // prettier-ignore
  public static createInnerElement<T>(parentEl: HTMLElement,
      baseButton: SVGGraphicsElement, state: keyof T, customStyles?: ButtonStateStyles<T>, isDropup = false) {
    // if the destination is specified to be dropup and content is not defined - use baseButton
    if (isDropup && !customStyles?.[state]?.svg?.content) return baseButton;
    return CustomButtonInnerElements.createSpecificStateElement(parentEl, state, customStyles) || baseButton;
  }
}
