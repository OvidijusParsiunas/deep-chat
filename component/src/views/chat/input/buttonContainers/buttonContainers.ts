import {ButtonPosition} from '../../../../types/button';

// outside-left, inside-left, inside-right, outside-right
export type ButtonContainersT = readonly [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement];

export class ButtonContainers {
  public static create() {
    return Array.from({length: 4}).map((_, index: number) => {
      const container = document.createElement('div');
      container.classList.add('input-button-container');
      if (index === 0 || index === 3) container.classList.add('outer-button-container');
      if (index === 1 || index === 2) container.classList.add('inner-button-container');
      return container;
    }) as unknown as ButtonContainersT;
  }

  public static add(inputContainer: HTMLElement, buttonContainers: ButtonContainersT) {
    inputContainer.insertBefore(buttonContainers[1], inputContainer.firstChild);
    inputContainer.insertBefore(buttonContainers[0], inputContainer.firstChild);
    inputContainer.appendChild(buttonContainers[2]);
    inputContainer.appendChild(buttonContainers[3]);
  }

  private static getContainerIndex(position: ButtonPosition) {
    if (position === 'outside-left') return 0;
    if (position === 'inside-left') return 1;
    if (position === 'inside-right') return 2;
    return 3;
  }

  public static addButton(buttonContainers: ButtonContainersT, elementRef: HTMLElement, position: ButtonPosition) {
    elementRef.classList.add(position);
    const containerIndex = ButtonContainers.getContainerIndex(position);
    buttonContainers[containerIndex].appendChild(elementRef);
    // explicitly defining the class incase client uses an incorrect string
    if (containerIndex === 3) elementRef.classList.add('outside-right');
  }
}
