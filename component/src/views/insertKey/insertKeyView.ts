import {KeyVerificationHandlers, ServiceIO} from '../../services/serviceIO';
import {VisibilityIcon} from './visibilityIcon';

export class InsertKeyView {
  private static createHelpLink() {
    const helpElement = document.createElement('a');
    helpElement.id = 'insert-key-input-help-link';
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

  private static onFail(inputEl: HTMLInputElement, failTextEl: HTMLElement, startEl: HTMLElement, message: string) {
    inputEl.classList.replace('insert-key-input-valid', 'insert-key-input-invalid');
    failTextEl.innerText = message;
    failTextEl.style.display = 'block';
    startEl.innerText = 'Start';
  }

  private static onLoad(startEl: HTMLElement) {
    startEl.innerHTML = '<div id="loading-ring"></div>';
  }

  // prettier-ignore
  private static createStartButton(inputEl: HTMLInputElement, failTextEl: HTMLElement,
      changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const startButtonElement = document.createElement('div');
    startButtonElement.id = 'start-button';
    startButtonElement.innerText = 'Start';
    const keyVerificationHandlers: KeyVerificationHandlers = {
      onSuccess: changeToChat,
      onFail: InsertKeyView.onFail.bind(this, inputEl, failTextEl, startButtonElement),
      onLoad: InsertKeyView.onLoad.bind(this, startButtonElement),
    };
    startButtonElement.onclick = serviceIO.verifyKey.bind(serviceIO, inputEl, keyVerificationHandlers);
    return startButtonElement;
  }

  private static onInputFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).classList.replace('insert-key-input-invalid', 'insert-key-input-valid');
  }

  private static createInput() {
    const inputContainer = document.createElement('div');
    inputContainer.id = 'insert-key-input-container';
    const inputElement = document.createElement('input');
    inputElement.id = 'insert-key-input';
    inputElement.placeholder = 'OpenAI API Key';
    inputElement.type = 'password';
    inputElement.classList.add('insert-key-input-valid');
    inputElement.onfocus = InsertKeyView.onInputFocus;
    inputContainer.appendChild(inputElement);
    return inputContainer;
  }

  private static createContents(changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const contentsElement = document.createElement('div');
    contentsElement.id = 'insert-key-contents';
    const inputContainerElement = InsertKeyView.createInput();
    const inputElement = inputContainerElement.children[0] as HTMLInputElement;
    const iconContainerElement = VisibilityIcon.create(inputElement);
    inputContainerElement.appendChild(iconContainerElement);
    contentsElement.appendChild(inputContainerElement);
    const {helpTextContainerElement, failTextElement} = InsertKeyView.createHelpTextContainer();
    contentsElement.appendChild(InsertKeyView.createStartButton(inputElement, failTextElement, changeToChat, serviceIO));
    contentsElement.appendChild(helpTextContainerElement);
    return contentsElement;
  }

  private static createElements(changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const containerElement = document.createElement('div');
    containerElement.id = 'insert-key';
    const contentsElement = InsertKeyView.createContents(changeToChat, serviceIO);
    containerElement.appendChild(contentsElement);
    return containerElement;
  }

  public static render(containerRef: HTMLElement, changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const containerElement = InsertKeyView.createElements(changeToChat, serviceIO);
    containerRef.replaceChildren(containerElement);
  }
}
