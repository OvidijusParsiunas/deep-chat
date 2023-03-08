import {SubmitButtonElStyles, SubmitButtonInnerElements} from '../../../../../types/submitButtonInternal';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SVGIconUtil} from '../../../../../utils/svg/svgIconUtil';

export class CustomInnerElements {
  private static createTextElement(text: string) {
    const textElement = document.createElement('div');
    textElement.innerText = text;
    return textElement;
  }

  private static createElement(string: string, isText: boolean) {
    return isText ? CustomInnerElements.createTextElement(string) : SVGIconUtil.createSVGElement(string);
  }

  private static createCustomElement(state: keyof SubmitButtonElStyles, customStyles?: SubmitButtonStyles) {
    if (!customStyles) return;
    const stateStyle = customStyles[state];
    if (stateStyle?.text?.string) return CustomInnerElements.createElement(stateStyle?.text?.string, true);
    if (stateStyle?.svg?.string) return CustomInnerElements.createElement(stateStyle?.svg?.string, false);
    return;
  }

  private static createSubmitCustomElement(customStyles?: SubmitButtonStyles) {
    const element = CustomInnerElements.createCustomElement('submit', customStyles);
    // custom inner element is using the submit icon style
    if (element) element.id = 'submit-icon';
    return element;
  }

  public static create(customStyles?: SubmitButtonStyles): Partial<SubmitButtonInnerElements> {
    // if the user has specified element for any state, it will be reused for next states
    const submit = CustomInnerElements.createSubmitCustomElement(customStyles);
    const loading = CustomInnerElements.createCustomElement('loading', customStyles) || submit;
    const stop = CustomInnerElements.createCustomElement('stop', customStyles) || loading;
    return {submit, loading, stop};
  }
}
