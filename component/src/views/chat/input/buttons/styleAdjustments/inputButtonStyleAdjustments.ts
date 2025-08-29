import {ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {PositionToButtons} from './inputButtonPositions';

export class InputButtonStyleAdjustments {
  private static readonly INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS = 'text-input-container-left-adjustment';
  private static readonly INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS = 'text-input-container-right-adjustment';
  private static readonly INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS = 'text-input-container-left-small-adjustment';
  private static readonly INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS = 'text-input-container-right-small-adjustment';

  private static adjustInputPadding(textInputEl: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs['inside-left'].length > 0) {
      textInputEl.classList.add('text-input-inner-left-adjustment');
    }
    if (pToBs['inside-right'].length > 0) {
      textInputEl.classList.add('text-input-inner-right-adjustment');
    }
  }

  private static adjustForOutsideButton(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs['outside-right'].length === 0 && pToBs['outside-left'].length > 0) {
      containers[0].classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS);
      fileAtt.classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS);
    } else if (pToBs['outside-left'].length === 0 && pToBs['outside-right'].length > 0) {
      containers[3].classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS);
      fileAtt.classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS);
    }
  }

  // when submit is the only button
  // when submit button is outside by itself - we increase the height for a better look
  private static adjustOutsideSubmit(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs['inside-left'].length > 0 || pToBs['inside-right'].length > 0) return;
    if (pToBs['outside-right'].length === 0 && pToBs['outside-left'].length > 0) {
      containers[0].classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS);
      fileAtt.classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS);
      return pToBs['outside-left'].map((element) => element.button.elementRef.classList.add('submit-button-enlarged'));
    } else if (pToBs['outside-left'].length === 0 && pToBs['outside-right'].length > 0) {
      containers[3].classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS);
      fileAtt.classList.add(InputButtonStyleAdjustments.INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS);
      return pToBs['outside-right'].map((element) => element.button.elementRef.classList.add('submit-button-enlarged'));
    }
    return undefined;
  }

  // prettier-ignore
  public static set(textInputEl: HTMLElement, containers: ButtonContainersT, fileAtt: HTMLElement,
      pToBs: PositionToButtons) {
    const adjustedForSubmit = !!InputButtonStyleAdjustments.adjustOutsideSubmit(containers, fileAtt, pToBs);
    if (!adjustedForSubmit) InputButtonStyleAdjustments.adjustForOutsideButton(containers, fileAtt, pToBs);
    InputButtonStyleAdjustments.adjustInputPadding(textInputEl, pToBs);
  }
}
