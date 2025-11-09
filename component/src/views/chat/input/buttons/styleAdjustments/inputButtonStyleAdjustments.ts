import {OUTSIDE_START, INSIDE_START, OUTSIDE_END, INSIDE_END} from '../../../../../utils/consts/inputConstants';
import {ButtonContainersT} from '../../buttonContainers/buttonContainers';
import {CLASS_LIST} from '../../../../../utils/consts/htmlConstants';
import {PositionToButtons} from './inputButtonPositions';
import {
  INPUT_OUTSIDE_START_SMALL_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_END_SMALL_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_START_ADJUSTMENT_CLASS,
  INPUT_OUTSIDE_END_ADJUSTMENT_CLASS,
} from '../../../../../utils/consts/classConstants';

export class InputButtonStyleAdjustments {
  private static adjustInputPadding(textInputEl: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[INSIDE_START].length > 0) {
      textInputEl[CLASS_LIST].add('text-input-inner-start-adjustment');
    }
    if (pToBs[INSIDE_END].length > 0) {
      textInputEl[CLASS_LIST].add('text-input-inner-end-adjustment');
    }
  }

  private static adjustForOutsideButton(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[OUTSIDE_END].length === 0 && pToBs[OUTSIDE_START].length > 0) {
      containers[0][CLASS_LIST].add(INPUT_OUTSIDE_START_SMALL_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_START_SMALL_ADJUSTMENT_CLASS);
    } else if (pToBs[OUTSIDE_START].length === 0 && pToBs[OUTSIDE_END].length > 0) {
      containers[3][CLASS_LIST].add(INPUT_OUTSIDE_END_SMALL_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_END_SMALL_ADJUSTMENT_CLASS);
    }
  }

  // when submit is the only button
  // when submit button is outside by itself - we increase the height for a better look
  private static adjustOutsideSubmit(containers: ButtonContainersT, fileAtt: HTMLElement, pToBs: PositionToButtons) {
    if (pToBs[INSIDE_START].length > 0 || pToBs[INSIDE_END].length > 0) return;
    if (pToBs[OUTSIDE_END].length === 0 && pToBs[OUTSIDE_START].length > 0) {
      containers[0][CLASS_LIST].add(INPUT_OUTSIDE_START_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_START_ADJUSTMENT_CLASS);
      return pToBs[OUTSIDE_START].map((element) => element.button.elementRef[CLASS_LIST].add('submit-button-enlarged'));
    } else if (pToBs[OUTSIDE_START].length === 0 && pToBs[OUTSIDE_END].length > 0) {
      containers[3][CLASS_LIST].add(INPUT_OUTSIDE_END_ADJUSTMENT_CLASS);
      fileAtt[CLASS_LIST].add(INPUT_OUTSIDE_END_ADJUSTMENT_CLASS);
      return pToBs[OUTSIDE_END].map((element) => element.button.elementRef[CLASS_LIST].add('submit-button-enlarged'));
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
