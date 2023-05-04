import {StatefulEvents} from '../../../../utils/element/statefulEvents';
import {StatefulStyles} from '../../../../types/styles';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

export class DropupItem {
  private static addItemEvents(menu: DropupMenu, item: HTMLElement, inputButtonElement: HTMLElement) {
    const statefulStyles: StatefulStyles = {
      hover: {backgroundColor: 'rgb(243, 243, 243)'},
      click: {backgroundColor: 'rgb(235, 235, 235)'},
    };
    StatefulEvents.add(item, statefulStyles);
    item.addEventListener('click', () => {
      inputButtonElement.click();
    });
    item.addEventListener('mouseenter', (event) => {
      menu.highlightedItem = event.target as HTMLElement;
    });
    item.addEventListener('mouseleave', () => {
      menu.highlightedItem = undefined;
    });
  }

  private static createItemText(dropupText?: string) {
    const textElement = document.createElement('div');
    textElement.textContent = dropupText || 'text';
    return textElement;
  }

  private static createItemIcon(inputButtonElement: HTMLElement) {
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('dropup-menu-item-icon');
    iconContainer.appendChild(inputButtonElement.children[0]);
    return iconContainer;
  }

  public static createItem(menu: DropupMenu, inputButton: InputButton) {
    const {elementRef, dropupText} = inputButton;
    const item = document.createElement('div');
    item.appendChild(DropupItem.createItemIcon(elementRef));
    item.appendChild(DropupItem.createItemText(dropupText));
    item.classList.add('dropup-menu-item');
    DropupItem.addItemEvents(menu, item, elementRef);
    return item;
  }
}
