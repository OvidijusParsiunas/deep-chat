import {SideContainersT} from '../sideContainers/sideContainers';
import {ButtonStyling} from './buttonStyling';

export class ButtonPosition {
  public static add(inputContainer: HTMLElement, sideContainers: SideContainersT, buttonStyling: ButtonStyling) {
    const {elementRef, position} = buttonStyling;
    elementRef.classList.add(position);
    if (position === 'inside-left' || position === 'inside-right') {
      inputContainer.appendChild(elementRef);
    } else if (position === 'outside-left') {
      sideContainers[0].appendChild(elementRef);
    } else {
      // explicitly defining the class incase client uses an incorrect string
      elementRef.classList.add('outside-right');
      sideContainers[1].appendChild(elementRef);
    }
  }
}
