import {KeyVerificationHandlers, ServiceIO} from '../../services/serviceIO';
import {KEYBOARD_KEY} from '../../utils/buttons/keyboardKeys';
import {VisibilityIcon} from './visibilityIcon';

export class InsertKeyView {
  private static createHelpLink(link: string) {
    const helpElement = document.createElement('a');
    helpElement.id = 'insert-key-input-help-link';
    helpElement.href = link;
    helpElement.innerText = 'Find more info here';
    helpElement.target = '_blank';
    return helpElement;
  }

  private static createFailText() {
    const failElement = document.createElement('div');
    failElement.id = 'insert-key-input-invalid-text';
    failElement.style.display = 'none';
    return failElement;
  }

  private static createHelpTextContainer(link?: string) {
    const helpTextContainerElement = document.createElement('div');
    helpTextContainerElement.id = 'insert-key-help-text-container';
    const helpTextContentsElement = document.createElement('div');
    helpTextContentsElement.id = 'insert-key-help-text-contents';
    const failTextElement = InsertKeyView.createFailText();
    helpTextContentsElement.appendChild(failTextElement);
    if (link) {
      const helpLinkElement = InsertKeyView.createHelpLink(link);
      helpTextContentsElement.appendChild(helpLinkElement);
    }
    helpTextContainerElement.appendChild(helpTextContentsElement);
    return {helpTextContainerElement, failTextElement};
  }

  private static onFail(inputEl: HTMLInputElement, startEl: HTMLElement, failTextEl: HTMLElement, message: string) {
    inputEl.classList.replace('insert-key-input-valid', 'insert-key-input-invalid');
    failTextEl.innerText = message;
    failTextEl.style.display = 'block';
    startEl.innerText = 'Start';
    inputEl.classList.remove('loading');
  }

  private static onLoad(inputEl: HTMLInputElement, startEl: HTMLElement) {
    inputEl.classList.add('loading');
    startEl.innerHTML = '<div id="loading-ring"></div>';
  }

  // prettier-ignore
  private static verifyKey(inputElement: HTMLInputElement, keyVerificationHandlers: KeyVerificationHandlers,
      serviceIO: ServiceIO) {
    const key = inputElement.value.trim();
    serviceIO.verifyKey.bind(serviceIO, key, keyVerificationHandlers);
  }

  // prettier-ignore
  private static addVerificationEvents(inputEl: HTMLInputElement, startEl: HTMLElement, failTextEl: HTMLElement,
      changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const keyVerificationHandlers: KeyVerificationHandlers = {
      onSuccess: changeToChat,
      onFail: InsertKeyView.onFail.bind(this, inputEl, startEl, failTextEl),
      onLoad: InsertKeyView.onLoad.bind(this, inputEl, startEl),
    };
    const verifyKeyFunc = InsertKeyView.verifyKey.bind(this, inputEl, keyVerificationHandlers, serviceIO);
    startEl.onclick = verifyKeyFunc;
    inputEl.onkeydown = (event) => {
      if (!inputEl.classList.contains('loading') && event.key === KEYBOARD_KEY.ENTER) verifyKeyFunc();
    };
  }

  private static createStartButton() {
    const startButtonElement = document.createElement('div');
    startButtonElement.id = 'start-button';
    startButtonElement.innerText = 'Start';
    return startButtonElement;
  }

  private static onInputFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).classList.replace('insert-key-input-invalid', 'insert-key-input-valid');
  }

  private static createInput(placeholderText?: string) {
    const inputContainer = document.createElement('div');
    inputContainer.id = 'insert-key-input-container';
    const inputElement = document.createElement('input');
    inputElement.id = 'insert-key-input';
    inputElement.placeholder = placeholderText || 'API Key';
    inputElement.type = 'password';
    inputElement.classList.add('insert-key-input-valid');
    inputElement.onfocus = InsertKeyView.onInputFocus;
    inputContainer.appendChild(inputElement);
    return inputContainer;
  }

  private static createContents(changeToChat: (key: string) => void, serviceIO: ServiceIO) {
    const contentsElement = document.createElement('div');
    contentsElement.id = 'insert-key-contents';
    const inputContainerElement = InsertKeyView.createInput(serviceIO.insertKeyPlaceholderText);
    const inputElement = inputContainerElement.children[0] as HTMLInputElement;
    const iconContainerElement = VisibilityIcon.create(inputElement);
    inputContainerElement.appendChild(iconContainerElement);
    contentsElement.appendChild(inputContainerElement);
    const startButton = InsertKeyView.createStartButton();
    const {helpTextContainerElement, failTextElement} = InsertKeyView.createHelpTextContainer(serviceIO.getKeyLink);
    contentsElement.appendChild(startButton);
    contentsElement.appendChild(helpTextContainerElement);
    InsertKeyView.addVerificationEvents(inputElement, startButton, failTextElement, changeToChat, serviceIO);
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
