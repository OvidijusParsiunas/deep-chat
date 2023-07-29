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
}
