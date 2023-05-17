import {KeyVerificationHandlers, ServiceIO} from '../../services/serviceIO';
import {AiAssistant} from '../../aiAssistant';
import {ErrorView} from '../error/errorView';

export class ValidateApiKeyPropertyView {
  private static onLoad(startElement: HTMLElement) {
    startElement.innerHTML = '<div id="large-loading-ring"></div>';
  }

  private static createElements() {
    const containerElement = document.createElement('div');
    containerElement.id = 'validate-property-key-view';
    return containerElement;
  }

  public static render(containerRef: HTMLElement, changeToChat: (key: string) => void, serviceIO: ServiceIO, key: string) {
    const containerElement = ValidateApiKeyPropertyView.createElements();
    const keyVerificationHandlers: KeyVerificationHandlers = {
      onSuccess: changeToChat,
      onFail: ErrorView.render.bind(this, containerRef, `Your 'key' has failed authentication`),
      onLoad: ValidateApiKeyPropertyView.onLoad.bind(this, containerElement),
    };
    serviceIO.verifyKey(key, keyVerificationHandlers);
    containerRef.replaceChildren(containerElement);
  }

  public static shouldBeRendered(aiAssistant: AiAssistant) {
    return aiAssistant.serviceKey && aiAssistant.validateKeyProperty;
  }
}
