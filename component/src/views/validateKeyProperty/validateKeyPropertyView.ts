import {KeyVerificationHandlers, ServiceIO} from '../../services/serviceIO';
import {ErrorView} from '../error/errorView';

export class ValidateKeyPropertyView {
  private static onLoad(startElement: HTMLElement) {
    startElement.innerHTML = '<div id="loading-validate-key-property"></div>';
  }

  private static createElements() {
    const containerElement = document.createElement('div');
    containerElement.id = 'validate-property-key-view';
    return containerElement;
  }

  public static render(containerRef: HTMLElement, changeToChat: () => void, serviceIO: ServiceIO) {
    const containerElement = ValidateKeyPropertyView.createElements();
    const keyVerificationHandlers: KeyVerificationHandlers = {
      onSuccess: changeToChat,
      onFail: ErrorView.render.bind(this, containerRef, `Your 'key' has failed authentication`),
      onLoad: ValidateKeyPropertyView.onLoad.bind(this, containerElement),
    };
    if (serviceIO.key) serviceIO.verifyKey(serviceIO.key, keyVerificationHandlers);
    containerRef.replaceChildren(containerElement);
  }
}
