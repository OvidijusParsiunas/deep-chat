import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {ObjectUtils} from '../../../../../utils/data/objectUtils';
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
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['container', 'default']);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['text', 'styles', 'default']);
    ObjectUtils.overwritePropertyObjectFromAnother(newStyle, styles.submit, ['svg', 'styles', 'default']);
    (styles[style] as ButtonStyles) = newStyle;
  }

  // prettier-ignore
  private static setUpDisabledButton(styles: SubmitButtonStyles) {
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['submit', 'container', 'default', 'backgroundColor'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['disabled', 'container', 'default', 'backgroundColor'], 'unset');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.submit, ['svg', 'styles', 'default', 'filter'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.disabled, ['svg', 'styles', 'default', 'filter'],
      'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(5564%)' +
      ' hue-rotate(207deg) brightness(100%) contrast(97%)');
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
