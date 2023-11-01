import {ObjectUtils} from '../../../../../utils/data/objectUtils';
import {DeepChat} from '../../../../../deepChat';
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
  public static prepare(deepChat: DeepChat) {
    deepChat.submitButtonStyles ??= {};
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles, ['submit'], {});
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles, ['disabled'], {});
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles.submit,
      ['container', 'default', 'backgroundColor'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles.disabled,
      ['container', 'default', 'backgroundColor'], 'white');
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles.submit,
      ['svg', 'styles', 'default', 'filter'], '');
    ObjectUtils.setPropertyValueIfDoesNotExist(deepChat.submitButtonStyles.disabled,
      ['svg', 'styles', 'default', 'filter'],
      'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(5564%)' +
      ' hue-rotate(207deg) brightness(100%) contrast(97%)');
  }
}
