import {ValidationHandler} from '../../../../types/validationHandler';
import {KEYBOARD_KEY} from '../../../../utils/buttons/keyboardKeys';
import {FileAttachments} from '../fileAttachments/fileAttachments';
import {FocusUtils} from './focusUtils';

export class TextInputEvents {
  // prettier-ignore
  private static readonly PERMITTED_KEYS = new Set<string>([
    KEYBOARD_KEY.BACKSPACE, KEYBOARD_KEY.DELETE, KEYBOARD_KEY.ARROW_RIGHT, KEYBOARD_KEY.ARROW_LEFT,
    KEYBOARD_KEY.ARROW_DOWN, KEYBOARD_KEY.ARROW_UP, KEYBOARD_KEY.META, KEYBOARD_KEY.CONTROL, KEYBOARD_KEY.ENTER
  ]);

  // prettier-ignore
  public static add(inputElement: HTMLElement, fileAts: FileAttachments, characterLimit?: number,
      validationHandler?: ValidationHandler) {
    if (characterLimit !== undefined) {
      inputElement.addEventListener('keydown', TextInputEvents.onKeyDown.bind(this, characterLimit));
    }
    inputElement.oninput = TextInputEvents.onInput.bind(this, characterLimit, validationHandler);
    inputElement.addEventListener('paste', (event) => {
      event.preventDefault();
      if (event.clipboardData?.files.length) fileAts.addFilesToAnyType(Array.from(event.clipboardData.files));
    });
  }

  // preventing insertion early for a nicer UX
  // prettier-ignore
  private static onKeyDown(characterLimit: number, event: KeyboardEvent) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent;
    if (textContent && textContent.length >= characterLimit
        && !TextInputEvents.PERMITTED_KEYS.has(event.key) && !TextInputEvents.isKeyCombinationPermitted(event)) {
      event.preventDefault();
    }
  }

  private static isKeyCombinationPermitted(event: KeyboardEvent) {
    if (event.key === 'a') {
      return event.ctrlKey || event.metaKey;
    }
    return false;
  }

  private static onInput(characterLimit: number | undefined, validate: ValidationHandler | undefined, event: Event) {
    const inputElement = event.target as HTMLElement;
    const textContent = inputElement.textContent || '';
    if (characterLimit !== undefined && textContent.length > characterLimit) {
      inputElement.textContent = textContent.substring(0, characterLimit);
      FocusUtils.focusEndOfInput(inputElement);
    }
    validate?.();
  }
}
