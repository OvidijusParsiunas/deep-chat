import {CLASS_LIST, CREATE_ELEMENT, STYLE} from '../../../../utils/consts/htmlConstants';
import {StatefulEvents} from '../../../../utils/element/statefulEvents';
import {CLICK, DEFAULT} from '../../../../utils/consts/inputConstants';
import {CustomStyle, StatefulStyles} from '../../../../types/styles';
import {ButtonInnerElements} from '../buttons/buttonInnerElements';
import {DropupMenuStyles} from '../../../../types/dropupStyles';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {TEXT} from '../../../../utils/consts/messageConstants';
import {CustomButton} from '../buttons/custom/customButton';
import {InputButton} from '../buttons/inputButton';
import {DropupMenu} from './dropupMenu';

export class DropupItem {
  public static MENU_ITEM_CLASS = 'dropup-menu-item';
  public static TEXT_CLASS = 'dropup-menu-item-text';
  public static ICON_CLASS = 'dropup-menu-item-icon';

  private static addItemEvents(menu: DropupMenu, item: HTMLElement, inputButton: HTMLElement, styles: StatefulStyles) {
    StatefulEvents.add(item, styles);
    item.addEventListener(CLICK, () => {
      inputButton[CLICK]();
    });
    item.addEventListener('mouseenter', (event) => {
      menu.highlightedItem = event.target as HTMLElement;
    });
    item.addEventListener('mouseleave', () => {
      menu.highlightedItem = undefined;
    });
  }

  public static createItemText(dropupText?: string, textStyle?: CustomStyle) {
    const textElement = CREATE_ELEMENT();
    Object.assign(textElement[STYLE], textStyle);
    textElement[CLASS_LIST].add(DropupItem.TEXT_CLASS);
    textElement.textContent = dropupText || 'File';
    return textElement;
  }

  public static createItemIcon(inputButtonElement: Element, iconContainerStyle?: CustomStyle) {
    const iconContainer = CREATE_ELEMENT();
    Object.assign(iconContainer[STYLE], iconContainerStyle);
    iconContainer[CLASS_LIST].add(DropupItem.ICON_CLASS);
    iconContainer.appendChild(inputButtonElement);
    return iconContainer;
  }

  private static populateItem(inputButton: InputButton, item: HTMLElement, styles?: DropupMenuStyles) {
    const {elementRef, dropupText, svg, customStyles} = inputButton;
    const buttonInnerElement = elementRef.children[0];
    const emptySVG = customStyles && Object.values(customStyles).find((style) => style.svg?.content === '');
    if (buttonInnerElement[CLASS_LIST].contains(ButtonInnerElements.INPUT_BUTTON_INNER_TEXT_CLASS)) {
      if (!emptySVG) item.appendChild(DropupItem.createItemIcon(svg, styles?.iconContainer));
      item.appendChild(DropupItem.createItemText(buttonInnerElement.textContent as string, styles?.[TEXT]));
    } else {
      if (!emptySVG) item.appendChild(DropupItem.createItemIcon(elementRef.children[0], styles?.iconContainer));
      item.appendChild(DropupItem.createItemText(dropupText, styles?.[TEXT]));
    }
  }

  public static createItem(menu: DropupMenu, inputButton: InputButton, styles?: DropupMenuStyles) {
    const item = CREATE_ELEMENT();
    Object.assign(item[STYLE], styles?.item?.[DEFAULT]);
    DropupItem.populateItem(inputButton, item, styles);
    item[CLASS_LIST].add(DropupItem.MENU_ITEM_CLASS);
    const {elementRef} = inputButton;
    if (inputButton.isCustom) {
      (inputButton as CustomButton).setDropupItem(item);
    } else {
      const statefulStyles = StyleUtils.processStateful(styles?.item || {});
      DropupItem.addItemEvents(menu, item, elementRef, statefulStyles);
    }
    return item;
  }
}
