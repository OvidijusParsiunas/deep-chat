export class ErrorView {
  public static render(containerElement: HTMLElement, text: string) {
    const errorMessageElement = document.createElement('div');
    errorMessageElement.id = 'error-view';
    errorMessageElement.innerText = text;
    containerElement.replaceChildren(errorMessageElement);
  }
}
