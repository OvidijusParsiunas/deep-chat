import {ButtonPosition as ButtonPositionT} from '../../../types/button';
import {SideContainersT} from './sideContainers/sideContainers';

export class ButtonPosition {
  // prettier-ignore
  public static add(inputContainer: HTMLElement, sideContainers: SideContainersT,
      buttonElement: HTMLElement, position: ButtonPositionT) {
    buttonElement.classList.add(position);
    if (position === 'inside-left' || position === 'inside-right') {
      inputContainer.appendChild(buttonElement);
    } else if (position === 'outside-left') {
      sideContainers[0].appendChild(buttonElement);
    } else {
      sideContainers[1].appendChild(buttonElement);
    }
  }
}
