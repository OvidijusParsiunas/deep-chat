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

  // prettier-ignore
  public static process(submitButtonStyles?: SubmitButtonStyles) {
    if (submitButtonStyles?.alwaysEnabled) return submitButtonStyles;
    const styles = JSON.parse(JSON.stringify(submitButtonStyles || {})) as SubmitButtonStyles;
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['submit', 'container', 'default', 'backgroundColor'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles, ['disabled', 'container', 'default', 'backgroundColor'], 'unset');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.submit, ['svg', 'styles', 'default', 'filter'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(styles.disabled, ['svg', 'styles', 'default', 'filter'],
      'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(5564%)' +
      ' hue-rotate(207deg) brightness(100%) contrast(97%)');
    const disabledStyles = JSON.parse(JSON.stringify(styles.disabled)) as ButtonStyles;
    ObjectUtils.overwritePropertyObjectFromAnother(disabledStyles, styles.submit, ['container', 'default']);
    ObjectUtils.overwritePropertyObjectFromAnother(disabledStyles, styles.submit, ['text', 'styles', 'default']);
    ObjectUtils.overwritePropertyObjectFromAnother(disabledStyles, styles.submit, ['svg', 'styles', 'default']);
    styles.disabled = disabledStyles;
    return styles;
  }
}
