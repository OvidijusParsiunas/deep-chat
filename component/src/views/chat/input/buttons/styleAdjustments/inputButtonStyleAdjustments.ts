import {ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {Positions} from './inputButtonPositions';

export class InputButtonStyleAdjustments {
  private static adjustInputPadding(textInputEl: HTMLElement, positions: Positions) {
    if (positions['inside-left'].length > 0) {
      textInputEl.classList.add('text-input-inner-left-adjustment');
    }
    if (positions['inside-right'].length > 0) {
      textInputEl.classList.add('text-input-inner-right-adjustment');
    }
  }

  private static adjustForOutsideButton(containers: ButtonContainersT, positions: Positions) {
    if (positions['outside-right'].length === 0 && positions['outside-left'].length > 0) {
      containers[0].classList.add('text-input-container-left-small-adjustment');
    } else if (positions['outside-left'].length === 0 && positions['outside-right'].length > 0) {
      containers[3].classList.add('text-input-container-right-small-adjustment');
    }
  }

  // when submit is the only button
  // when submit button is outside by itself - we increase the height for a better look
  private static adjustOutsideSubmit(containers: ButtonContainersT, positions: Positions) {
    if (positions['inside-left'].length > 0 || positions['inside-right'].length > 0) return;
    if (positions['outside-right'].length === 0 && positions['outside-left'].length > 0) {
      containers[0].classList.add('text-input-container-left-adjustment');
      return positions['outside-left'].map((element) => element.button.elementRef.classList.add('submit-button-enlarged'));
    } else if (positions['outside-left'].length === 0 && positions['outside-right'].length > 0) {
      containers[3].classList.add('text-input-container-right-adjustment');
      return positions['outside-right'].map((element) =>
        element.button.elementRef.classList.add('submit-button-enlarged')
      );
    }
    return undefined;
  }

  public static set(textInputEl: HTMLElement, containers: ButtonContainersT, positions: Positions) {
    const adjustedForSubmit = !!InputButtonStyleAdjustments.adjustOutsideSubmit(containers, positions);
    if (!adjustedForSubmit) InputButtonStyleAdjustments.adjustForOutsideButton(containers, positions);
    InputButtonStyleAdjustments.adjustInputPadding(textInputEl, positions);
  }
}
