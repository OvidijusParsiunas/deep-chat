import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {FocusUtils} from './focusUtils';

export class InputLimit {
  // prettier-ignore
  private static readonly PERMITTED_KEYS = new Set<string>([
    KEYBOARD_KEY.BACKSPACE, KEYBOARD_KEY.DELETE, KEYBOARD_KEY.ARROW_RIGHT, KEYBOARD_KEY.ARROW_LEFT,
    KEYBOARD_KEY.ARROW_DOWN, KEYBOARD_KEY.ARROW_UP, KEYBOARD_KEY.META, KEYBOARD_KEY.CONTROL, KEYBOARD_KEY.ENTER
  ]);

  public static add(inputElement: HTMLElement, characterLimit: number) {
    inputElement.addEventListener('keydown', InputLimit.onKeyDown.bind(this, characterLimit));
    inputElement.oninput = InputLimit.onInput.bind(this, characterLimit);
  }

  // preventing insertion early for a nicer UX
  // prettier-ignore
  private static onKeyDown(characterLimit: number, event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent;
    if (textContent && textContent.length >= characterLimit
        && !InputLimit.PERMITTED_KEYS.has(event.key) && !InputLimit.isKeyCombinationPermitted(event)) {
      event.preventDefault();
    }
  }

  private static isKeyCombinationPermitted(event: KeyboardEvent) {
    if (event.key === 'a') {
      return event.ctrlKey || event.metaKey;
    }
    return false;
  }

  // removing text characters after paste or other events
  private static onInput(characterLimit: number, event: Event) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent;
    if (textContent && textContent.length > characterLimit) {
      inputElement.textContent = textContent.substring(0, characterLimit);
      FocusUtils.focusEndOfInput(inputElement);
    }
  }
}
