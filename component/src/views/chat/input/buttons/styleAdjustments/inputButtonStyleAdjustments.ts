import {Positions} from './inputButtonPositions';

export class InputButtonStyleAdjustments {
  public static set(textInput: HTMLElement, positions: Positions) {
    if (positions['outside-left'].length === 0 && positions['outside-right'].length > 0) {
      textInput.classList.add('text-input-container-left-adjustment');
      positions['outside-right'].forEach((element) => element.button.elementRef.classList.add('input-button-enlarged'));
    } else if (positions['outside-right'].length === 0 && positions['outside-left'].length > 0) {
      textInput.classList.add('text-input-container-right-adjustment');
      positions['outside-left'].forEach((element) => element.button.elementRef.classList.add('input-button-enlarged'));
    }
  }
}
