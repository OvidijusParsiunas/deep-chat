import {OpenAIClient} from '../../client/openAI/openAIClient';

export class InsertKeyView {
  private static createHelpLink() {
    const helpElement = document.createElement('a');
    helpElement.id = 'help-link';
    helpElement.href = 'https://platform.openai.com/account/api-keys';
    helpElement.innerText = 'Get OpenAI API Key';
    helpElement.target = '_blank';
    return helpElement;
  }

  private static createFailText() {
    const failElement = document.createElement('div');
    failElement.id = 'insert-key-input-invalid-text';
    failElement.style.display = 'none';
    return failElement;
  }

  private static onFail(inputEl: HTMLInputElement, failTextEl: HTMLElement, message: string) {
    inputEl.classList.replace('insert-key-input-valid', 'insert-key-input-invalid');
    failTextEl.innerText = message;
    failTextEl.style.display = 'block';
  }

  // prettier-ignore
  private static createSubmitButton(inputEl: HTMLInputElement, failTextEl: HTMLElement,
      changeToChat: (key: string) => void) {
    const submitButton = document.createElement('div');
    submitButton.id = 'submit-key-button';
    submitButton.innerText = 'Submit';
    submitButton.onclick = OpenAIClient.verifyKey.bind(this, inputEl, changeToChat,
      InsertKeyView.onFail.bind(this, inputEl, failTextEl));
    return submitButton;
  }

  private static onInputFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).classList.replace('insert-key-input-invalid', 'insert-key-input-valid');
  }

  private static createInput() {
    const inputElement = document.createElement('input');
    inputElement.id = 'insert-key-input';
    inputElement.placeholder = 'OpenAI API Key';
    inputElement.type = 'password';
    inputElement.classList.add('insert-key-input-valid');
    inputElement.onfocus = InsertKeyView.onInputFocus;
    return inputElement;
  }

  private static createHelpTextContainer() {
    const helpTextContainerElement = document.createElement('div');
    helpTextContainerElement.id = 'insert-key-help-text-container';
    const helpTextContentsElement = document.createElement('div');
    helpTextContentsElement.id = 'insert-key-help-text-contents';
    const failTextElement = InsertKeyView.createFailText();
    helpTextContentsElement.appendChild(failTextElement);
    const helpLinkElement = InsertKeyView.createHelpLink();
    helpTextContentsElement.appendChild(helpLinkElement);
    helpTextContainerElement.appendChild(helpTextContentsElement);
    return {helpTextContainerElement, helpLinkElement, failTextElement};
  }

  private static createContents(changeToChat: (key: string) => void) {
    const contentsElement = document.createElement('div');
    contentsElement.id = 'insert-key-contents';
    const inputElement = InsertKeyView.createInput();
    contentsElement.appendChild(inputElement);
    const {helpTextContainerElement, failTextElement} = InsertKeyView.createHelpTextContainer();
    contentsElement.appendChild(InsertKeyView.createSubmitButton(inputElement, failTextElement, changeToChat));
    contentsElement.appendChild(helpTextContainerElement);
    return contentsElement;
  }

  private static createElements(changeToChat: (key: string) => void) {
    const containerElement = document.createElement('div');
    containerElement.id = 'insert-key';
    const contentsElement = InsertKeyView.createContents(changeToChat);
    containerElement.appendChild(contentsElement);
    return containerElement;
  }

  public static render(containerRef: HTMLElement, changeToChat: (key: string) => void) {
    const containerElement = InsertKeyView.createElements(changeToChat);
    containerRef.replaceChildren(containerElement);
  }
}
