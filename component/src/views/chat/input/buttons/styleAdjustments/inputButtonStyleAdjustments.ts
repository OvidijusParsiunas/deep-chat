import {TextInputEl} from '../../textInput/textInput';
import {Positions} from './inputButtonPositions';

// when submit button is outside by itself - we increase the height for a better look
export class InputButtonStyleAdjustments {
  private static adjustOutsideSubmit(textInput: HTMLElement, positions: Positions) {
    if (positions['inside-left'].length > 0 || positions['inside-right'].length > 0) return;
    if (positions['outside-left'].length === 0 && positions['outside-right'].length > 0) {
      textInput.classList.add('text-input-container-left-adjustment');
      positions['outside-right'].forEach((element) => element.button.elementRef.classList.add('input-button-enlarged'));
    } else if (positions['outside-right'].length === 0 && positions['outside-left'].length > 0) {
      textInput.classList.add('text-input-container-right-adjustment');
      positions['outside-left'].forEach((element) => element.button.elementRef.classList.add('input-button-enlarged'));
    }
  }

  public static set(textInput: TextInputEl, positions: Positions) {
    InputButtonStyleAdjustments.adjustOutsideSubmit(textInput.elementRef, positions);
    if (positions['inside-left'].length > 0) {
      textInput.inputElementRef.classList.add('text-input-inner-left-adjustment');
    }
    if (positions['inside-right'].length > 0) {
      textInput.inputElementRef.classList.add('text-input-inner-right-adjustment');
    }
  }
}
