import {CREATE_ELEMENT} from '../../utils/consts/htmlConstants';

export class ErrorView {
  public static render(containerElement: HTMLElement, text: string) {
    const errorMessageElement = CREATE_ELEMENT();
    errorMessageElement.id = 'error-view';
    errorMessageElement.innerText = text;
    containerElement.replaceChildren(errorMessageElement);
  }
}
