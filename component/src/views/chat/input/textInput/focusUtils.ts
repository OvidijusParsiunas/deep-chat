import {Browser} from '../../../../utils/browser/browser';
import {TextInputEl} from './textInput';

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
    const inputElement = parentElement.querySelector(`#${TextInputEl.TEXT_INPUT_ID}`) as HTMLElement;
    if (inputElement) {
      if (Browser.IS_SAFARI) inputElement.focus(); // can only focus the start of the input in Safari
      FocusUtils.focusEndOfInput(inputElement);
    }
  }
}
