import {SubmitButtonElStyles} from '../../../../../types/submitButtonInternal';
import {SubmitButtonStyles} from '../../../../../types/submitButton';
import {SubmitButtonEvents} from './submitButtonEvents';
import {SubmitButtonCSS} from './submitButtonCSS';
import {MouseState} from './submitButton';

export class SubmitButtonStateStyle {
  // prettier-ignore
  public static unsetFirstAvailable(button: HTMLElement,
      styles: SubmitButtonElStyles, unsetTypes: (keyof SubmitButtonElStyles)[]) {
    for (let i = 0; i < unsetTypes.length; i += 1) {
      const type = unsetTypes[i];
      const style = type && styles[type];
      if (style) SubmitButtonCSS.unsetButtonElementAllCSS(button, style);
    }
  }

  // prettier-ignore
  public static reapply(button: HTMLElement, styles: SubmitButtonElStyles, mouseState: MouseState,
      setType: keyof SubmitButtonElStyles, unsetTypes?: (keyof SubmitButtonElStyles)[]) {
    const setStyle = styles?.[setType];
    if (setStyle) {
      if (unsetTypes) SubmitButtonStateStyle.unsetFirstAvailable(button, styles, unsetTypes);
      SubmitButtonCSS.setElementsCSS(button, setStyle, mouseState.state);
      SubmitButtonEvents.setEvents(button, setStyle, mouseState);
    }
  }

  public static resetSubmit(button: HTMLElement, styles: SubmitButtonStyles, mouseState: MouseState, wasLoading: boolean) {
    if (wasLoading) {
      SubmitButtonStateStyle.unsetFirstAvailable(button, styles, ['loading', 'submit']);
    } else {
      SubmitButtonStateStyle.unsetFirstAvailable(button, styles, ['stop', 'loading', 'submit']);
    }
    SubmitButtonStateStyle.reapply(button, styles, mouseState, 'submit');
  }
}
