import {FocusUtils} from './focusUtils';

export class InputLimit {
  // prettier-ignore
  private static readonly ALLOWED_KEYS = new Set<string>([
      'Backspace', 'Delete', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Meta', 'Control'
    ]);

  public static add(inputELement: HTMLElement, inputCharacterLimit: number) {
    inputELement.onkeydown = InputLimit.onKeyDown.bind(this, inputCharacterLimit);
    inputELement.oninput = InputLimit.onInput.bind(this, inputCharacterLimit);
  }

  // preventing insertion early for a nicer UX
  // prettier-ignore
  private static onKeyDown(inputCharacterLimit: number, event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent;
    if (textContent && textContent.length >= inputCharacterLimit
        && !InputLimit.ALLOWED_KEYS.has(event.key) && !InputLimit.isKeyCombinationAllowed(event)) {
      event.preventDefault();
    }
  }

  private static isKeyCombinationAllowed(event: KeyboardEvent) {
    if (event.key === 'a') {
      return event.ctrlKey || event.metaKey;
    }
    return false;
  }

  // removing text characters after paste or other events
  private static onInput(inputCharacterLimit: number, event: Event) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent;
    if (textContent && textContent.length > inputCharacterLimit) {
      inputElement.textContent = textContent.substring(0, inputCharacterLimit);
      FocusUtils.focusEndOfInput(inputElement);
    }
  }
}
