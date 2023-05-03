import {ButtonPosition} from '../../../../types/button';

export type SideContainersT = readonly [HTMLElement, HTMLElement];

export class SideContainers {
  public static create(): SideContainersT {
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('side-container');
    const rightContainer = document.createElement('div');
    rightContainer.classList.add('side-container');
    return [leftContainer, rightContainer];
  }

  public static add(inputContainer: HTMLElement, sideContainers: SideContainersT) {
    inputContainer.insertBefore(sideContainers[0], inputContainer.firstChild);
    inputContainer.appendChild(sideContainers[1]);
  }

  // prettier-ignore
  public static addButton(inputContainer: HTMLElement, sideContainers: SideContainersT, elementRef: HTMLElement,
      position: ButtonPosition) {
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
