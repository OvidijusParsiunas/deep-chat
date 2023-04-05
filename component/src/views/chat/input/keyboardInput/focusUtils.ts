import {KeyboardInput} from './keyboardInput';

export class FocusUtils {
  public static focusEndOfInput(inputElement: HTMLElement) {
    const range = document.createRange(); // create a new Range object
    range.selectNodeContents(inputElement); // set the Range object to contain the contents of the contentEditable div
    range.collapse(false); // collapse the Range object to the end of the contents
    const sel = window.getSelection(); // get the current selection object
    sel?.removeAllRanges(); // remove any existing ranges from the selection object
    sel?.addRange(range); // add the new range to the selection object, setting the cursor to the end of the contents
  }

  public static focusFromParentElement(parentElement: HTMLElement) {
    const inputElement = parentElement.querySelector(`#${KeyboardInput.KEYBOARD_INPUT_ID}`) as HTMLElement;
    FocusUtils.focusEndOfInput(inputElement);
  }
}
