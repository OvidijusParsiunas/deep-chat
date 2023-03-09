import {SubmitButton} from './submitButton';

export class SubmitButtonStateStyle {
  public static resetSubmit(submitButton: SubmitButton, wasLoading: boolean) {
    if (wasLoading) {
      submitButton.unsetFirstAvailableStateStyle(['loading', 'submit']);
    } else {
      submitButton.unsetFirstAvailableStateStyle(['stop', 'loading', 'submit']);
    }
    submitButton.reapplyStateStyle(true, 'submit');
  }
}
