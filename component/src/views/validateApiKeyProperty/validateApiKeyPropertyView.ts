import {KeyVerificationHandlers, ServiceIO} from '../../services/serviceIO';
import {AiAssistant} from '../../aiAssistant';

export class ValidateApiKeyPropertyView {
  private static onFail(startEl: HTMLElement) {
    const errorMessageElement = document.createElement('div');
    errorMessageElement.id = 'validate-property-key-error';
    errorMessageElement.innerText = `Your 'apiKey' has failed authentication`;
    startEl.replaceChildren(errorMessageElement);
  }

  private static onLoad(startElement: HTMLElement) {
    startElement.innerHTML = '<div id="large-loading-ring"></div>';
  }

  private static createElements() {
    const containerElement = document.createElement('div');
    containerElement.id = 'validate-property-key';
    return containerElement;
  }

  public static render(containerRef: HTMLElement, changeToChat: (key: string) => void, serviceIO: ServiceIO, key: string) {
    const containerElement = ValidateApiKeyPropertyView.createElements();
    const keyVerificationHandlers: KeyVerificationHandlers = {
      onSuccess: changeToChat,
      onFail: ValidateApiKeyPropertyView.onFail.bind(this, containerElement),
      onLoad: ValidateApiKeyPropertyView.onLoad.bind(this, containerElement),
    };
    serviceIO.verifyKey(key, keyVerificationHandlers);
    containerRef.replaceChildren(containerElement);
  }

  public static shouldBeRendered(aiAssistant: AiAssistant) {
    return aiAssistant.apiKey && aiAssistant.validateKeyProperty;
  }
}
