import {StatefulEvents} from '../../../../utils/element/statefulEvents';
import {CustomStyle, StatefulStyles} from '../../../../types/styles';
import {DropupMenuStyles} from '../../../../types/dropupStyles';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

export class DropupItem {
  private static addItemEvents(menu: DropupMenu, item: HTMLElement, inputButton: HTMLElement, styles: StatefulStyles) {
    StatefulEvents.add(item, styles);
    item.addEventListener('click', () => {
      inputButton.click();
    });
    item.addEventListener('mouseenter', (event) => {
      menu.highlightedItem = event.target as HTMLElement;
    });
    item.addEventListener('mouseleave', () => {
      menu.highlightedItem = undefined;
    });
  }

  private static createItemText(dropupText?: string, textStyle?: CustomStyle) {
    const textElement = document.createElement('div');
    Object.assign(textElement.style, textStyle);
    textElement.classList.add('dropup-menu-item-text');
    textElement.textContent = dropupText || 'File';
    return textElement;
  }

  private static createItemIcon(inputButtonElement: HTMLElement, iconContainerStyle?: CustomStyle) {
    const iconContainer = document.createElement('div');
    Object.assign(iconContainer.style, iconContainerStyle);
    iconContainer.classList.add('dropup-menu-item-icon');
    iconContainer.appendChild(inputButtonElement.children[0]);
    return iconContainer;
  }

  private static populateItem(elementRef: HTMLElement, item: HTMLElement, dropupText?: string, styles?: DropupMenuStyles) {
    const buttonInnerElement = elementRef.children[0];
    if (buttonInnerElement.classList.contains('text-button')) {
      item.appendChild(DropupItem.createItemText(buttonInnerElement.textContent as string, styles?.text));
    } else {
      item.appendChild(DropupItem.createItemIcon(elementRef, styles?.iconContainer));
      item.appendChild(DropupItem.createItemText(dropupText, styles?.text));
    }
  }

  // prettier-ignore
  public static createItem(menu: DropupMenu, inputButton: InputButton, styles?: DropupMenuStyles) {
    const {elementRef, dropupText} = inputButton;
    const item = document.createElement('div');
    Object.assign(item.style, styles?.item?.default);
    DropupItem.populateItem(elementRef, item, dropupText, styles);
    item.classList.add('dropup-menu-item');
    const statefulStyles = StyleUtils.processStateful(
      styles?.item || {}, {backgroundColor: '#f3f3f3'}, {backgroundColor: '#ebebeb'});
    DropupItem.addItemEvents(menu, item, elementRef, statefulStyles);
    return item;
  }
}
