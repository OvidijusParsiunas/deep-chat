import {DEFAULT, DISABLED, LOADING, STOP, SUBMIT, SVG} from '../../../../../utils/consts/inputConstants';
import {DEEP_COPY, TEXT} from '../../../../../utils/consts/messageConstants';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {ObjectUtils} from '../../../../../utils/data/objectUtils';
import {UNSET} from '../../../../../utils/consts/htmlConstants';
import {ButtonStyles} from '../../../../../types/button';
import {SubmitButton} from './submitButton';

export class SubmitButtonStateStyle {
  public static resetSubmit(submitButton: SubmitButton, wasLoading: boolean) {
    if (wasLoading) {
      submitButton.unsetCustomStateStyles([LOADING, SUBMIT]);
    } else {
      submitButton.unsetCustomStateStyles([STOP, LOADING, SUBMIT]);
    }
    submitButton.reapplyStateStyle(SUBMIT);
  }

  private static overwriteDefaultStyleWithSubmit(styles: SubmitButtonStyles, style: keyof SubmitButtonStyles) {
    if (!styles.submit) return;
    const newStyle = DEEP_COPY(styles[style] || {}) as ButtonStyles;
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['container', DEFAULT]);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, [TEXT, 'styles', DEFAULT]);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, [SVG, 'styles', DEFAULT]);
    (styles[style] as ButtonStyles) = newStyle;
  }

  // prettier-ignore
  private static setUpDisabledButton(styles: SubmitButtonStyles) {
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, [SUBMIT, 'container', DEFAULT, 'backgroundColor'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, [DISABLED, 'container', DEFAULT, 'backgroundColor'], UNSET);
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.submit, [SVG, 'styles', DEFAULT, 'filter'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles[DISABLED], [SVG, 'styles', DEFAULT, 'filter'],
      'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(5564%)' +
      ' hue-rotate(207deg) brightness(100%) contrast(97%)');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles[DISABLED], [TEXT, 'styles', DEFAULT, 'color'], 'grey');
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, DISABLED);
  }

  public static process(submitButtonStyles?: SubmitButtonStyles) {
    const styles = DEEP_COPY(submitButtonStyles || {}) as SubmitButtonStyles;
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, LOADING);
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, STOP);
    if (submitButtonStyles?.alwaysEnabled) return styles;
    SubmitButtonStateStyle.setUpDisabledButton(styles);
    return styles;
  }
}
