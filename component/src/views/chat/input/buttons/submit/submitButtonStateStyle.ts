import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {DEFAULT} from '../../../../../utils/consts/inputConstants';
import {ObjectUtils} from '../../../../../utils/data/objectUtils';
import {TEXT} from '../../../../../utils/consts/messageConstants';
import {UNSET} from '../../../../../utils/consts/htmlConstants';
import {ButtonStyles} from '../../../../../types/button';
import {SubmitButton} from './submitButton';

export class SubmitButtonStateStyle {
  public static resetSubmit(submitButton: SubmitButton, wasLoading: boolean) {
    if (wasLoading) {
      submitButton.unsetCustomStateStyles(['loading', 'submit']);
    } else {
      submitButton.unsetCustomStateStyles(['stop', 'loading', 'submit']);
    }
    submitButton.reapplyStateStyle('submit');
  }

  private static overwriteDefaultStyleWithSubmit(styles: SubmitButtonStyles, style: keyof SubmitButtonStyles) {
    if (!styles.submit) return;
    const newStyle = JSON.parse(JSON.stringify(styles[style] || {})) as ButtonStyles;
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['container', DEFAULT]);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, [TEXT, 'styles', DEFAULT]);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['svg', 'styles', DEFAULT]);
    (styles[style] as ButtonStyles) = newStyle;
  }

  // prettier-ignore
  private static setUpDisabledButton(styles: SubmitButtonStyles) {
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['submit', 'container', DEFAULT, 'backgroundColor'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['disabled', 'container', DEFAULT, 'backgroundColor'], UNSET);
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.submit, ['svg', 'styles', DEFAULT, 'filter'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.disabled, ['svg', 'styles', DEFAULT, 'filter'],
      'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(5564%)' +
      ' hue-rotate(207deg) brightness(100%) contrast(97%)');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.disabled, [TEXT, 'styles', DEFAULT, 'color'], 'grey');
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, 'disabled');
  }

  public static process(submitButtonStyles?: SubmitButtonStyles) {
    const styles = JSON.parse(JSON.stringify(submitButtonStyles || {})) as SubmitButtonStyles;
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, 'loading');
    SubmitButtonStateStyle.overwriteDefaultStyleWithSubmit(styles, 'stop');
    if (submitButtonStyles?.alwaysEnabled) return styles;
    SubmitButtonStateStyle.setUpDisabledButton(styles);
    return styles;
  }
}
