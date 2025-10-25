import {INSIDE_START, INSIDE_END, OUTSIDE_START, OUTSIDE_END} from '../../../../utils/consts/inputConstants';
import {CLASS_LIST, CREATE_ELEMENT} from '../../../../utils/consts/htmlConstants';
import {ButtonPosition} from '../../../../types/button';

// outside-start, inside-start, inside-end, outside-end
export type ButtonContainersT = readonly [HTMLDivElement, HTMLDivElement, HTMLDivElement, HTMLDivElement];

export class ButtonContainers {
  public static create() {
    return Array.from({length: 4}).map((_, index: number) => {
      const container = CREATE_ELEMENT();
      container[CLASS_LIST].add('input-button-container');
      if (index === 0 || index === 3) container[CLASS_LIST].add('outer-button-container');
      if (index === 1 || index === 2) container[CLASS_LIST].add('inner-button-container');
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
    if (position === OUTSIDE_START) return 0;
    if (position === INSIDE_START) return 1;
    if (position === INSIDE_END) return 2;
    return 3;
  }

  public static addButton(buttonContainers: ButtonContainersT, elementRef: HTMLElement, position: ButtonPosition) {
    elementRef[CLASS_LIST].add(position);
    const containerIndex = ButtonContainers.getContainerIndex(position);
    buttonContainers[containerIndex].appendChild(elementRef);
    // explicitly defining the class incase client uses an incorrect string
    if (containerIndex === 3) elementRef[CLASS_LIST].add(OUTSIDE_END);
  }
}
