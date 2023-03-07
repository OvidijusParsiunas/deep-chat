import {SubmitButtonElementsStyle} from '../../../../types/submitButton';
import {SubmitButtonCSS} from './submitButtonCSS';
import {MouseState} from './submitButton';

export class SubmitButtonEvents {
  private static buttonMouseLeave(button: HTMLElement, customStyles: SubmitButtonElementsStyle, mouseState: MouseState) {
    SubmitButtonCSS.unsetButtonElementAllCSS(button, customStyles);
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'default');
    mouseState.state = 'default';
  }

  private static buttonMouseEnter(button: HTMLElement, customStyles: SubmitButtonElementsStyle, mouseState: MouseState) {
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'hover');
    mouseState.state = 'hover';
  }

  private static buttonMouseDown(button: HTMLElement, customStyles: SubmitButtonElementsStyle, mouseState: MouseState) {
    SubmitButtonCSS.setElementsCSS(button, customStyles, 'click');
    mouseState.state = 'click';
  }

  public static setEvents(button: HTMLElement, customStyles: SubmitButtonElementsStyle, mouseState: MouseState) {
    button.onmousedown = SubmitButtonEvents.buttonMouseDown.bind(this, button, customStyles, mouseState);
    button.onmouseenter = SubmitButtonEvents.buttonMouseEnter.bind(this, button, customStyles, mouseState);
    button.onmouseleave = SubmitButtonEvents.buttonMouseLeave.bind(this, button, customStyles, mouseState);
  }
}
