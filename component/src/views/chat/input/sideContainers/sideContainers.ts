export type SideContainersT = readonly [HTMLElement, HTMLElement];

export class SideContainers {
  public static create() {
    const leftContainer = document.createElement('div');
    leftContainer.classList.add('side-container');
    const rightContainer = document.createElement('div');
    rightContainer.classList.add('side-container');
    return [leftContainer, rightContainer] as const;
  }

  public static add(inputContainer: HTMLElement, sideContainers: SideContainersT) {
    inputContainer.insertBefore(sideContainers[0], inputContainer.firstChild);
    inputContainer.appendChild(sideContainers[1]);
  }
}
