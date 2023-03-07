import {SubmitButtonElementsStyle} from '../../../../types/submitButton';
import {SubmitButtonCSS} from './submitButtonCSS';
import {MouseState} from './submitButton';

export class SubmitButtonEvents {
  // prettier-ignore
  private static buttonMouseLeave(button: HTMLElement, icon: HTMLElement, customStyles: SubmitButtonElementsStyle,
      mouseState: MouseState) {
    SubmitButtonCSS.unsetButtonElementAllCSS(button, customStyles);
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'default');
    mouseState.state = 'default';
  }

  // prettier-ignore
  private static buttonMouseEnter(button: HTMLElement, icon: HTMLElement, customStyles: SubmitButtonElementsStyle,
      mouseState: MouseState) {
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'hover');
    mouseState.state = 'hover';
  }

  // prettier-ignore
  private static buttonMouseDown(button: HTMLElement, icon: HTMLElement, customStyles: SubmitButtonElementsStyle,
      mouseState: MouseState) {
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'click');
    mouseState.state = 'click';
  }

  public static setEvents(button: HTMLElement, customStyles: SubmitButtonElementsStyle, mouseState: MouseState) {
    const icon = button.children[0] as HTMLElement;
    button.onmousedown = SubmitButtonEvents.buttonMouseDown.bind(this, button, icon, customStyles, mouseState);
    button.onmouseenter = SubmitButtonEvents.buttonMouseEnter.bind(this, button, icon, customStyles, mouseState);
    button.onmouseleave = SubmitButtonEvents.buttonMouseLeave.bind(this, button, icon, customStyles, mouseState);
  }
}
