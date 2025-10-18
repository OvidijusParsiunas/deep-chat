import {ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {CLASS_LIST} from '../../../../../utils/consts/htmlConstants';
import {PositionToButtons} from './inputButtonPositions';
import {
  INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS,
  OUTSIDE_RIGHT,
  INSIDE_RIGHT,
  OUTSIDE_LEFT,
  INSIDE_LEFT,
} from '../../../../../utils/consts/inputConstants';

export class InputButtonStyleAdjustments {
  private static adjustInputPadding(textInputEl: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[INSIDE_LEFT].length > 0) {
      textInputEl[CLASS_LIST].add('text-input-inner-left-adjustment');
    }
    if (pToBs[INSIDE_RIGHT].length > 0) {
      textInputEl[CLASS_LIST].add('text-input-inner-right-adjustment');
    }
  }

  private static adjustForOutsideButton(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[OUTSIDE_RIGHT].length === 0 && pToBs[OUTSIDE_LEFT].length > 0) {
      containers[0][CLASS_LIST].add(INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_LEFT_SMALL_ADJUSTMENT_CLASS);
    } else if (pToBs[OUTSIDE_LEFT].length === 0 && pToBs[OUTSIDE_RIGHT].length > 0) {
      containers[3][CLASS_LIST].add(INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_RIGHT_SMALL_ADJUSTMENT_CLASS);
    }
  }

  // when submit is the only button
  // when submit button is outside by itself - we increase the height for a better look
  private static adjustOutsideSubmit(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[INSIDE_LEFT].length > 0 || pToBs[INSIDE_RIGHT].length > 0) return;
    if (pToBs[OUTSIDE_RIGHT].length === 0 && pToBs[OUTSIDE_LEFT].length > 0) {
      containers[0][CLASS_LIST].add(INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_LEFT_ADJUSTMENT_CLASS);
      return pToBs[OUTSIDE_LEFT].map((element) => element.button.elementRef[CLASS_LIST].add('submit-button-enlarged'));
    } else if (pToBs[OUTSIDE_LEFT].length === 0 && pToBs[OUTSIDE_RIGHT].length > 0) {
      containers[3][CLASS_LIST].add(INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_RIGHT_ADJUSTMENT_CLASS);
      return pToBs[OUTSIDE_RIGHT].map((element) => element.button.elementRef[CLASS_LIST].add('submit-button-enlarged'));
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
