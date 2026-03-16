import {MOUSEENTER, MOUSELEAVE} from '../../../../utils/consts/inputConstants';
import {DropupMenu} from './dropupMenu';

export class DropupItemNavigation {
  private static focusItemWhenOnEdge(menu: DropupMenu, isNext: boolean) {
    const dropupElement = menu.elementRef;
    const nextItem = isNext ? dropupElement.children[0] : dropupElement.children[dropupElement.children.length - 1];
    DropupItemNavigation.focusSiblingItem(menu, nextItem as HTMLElement, isNext, true);
  }

  // isEdgeItem means is it a start or end item
  public static focusSiblingItem(menu: DropupMenu, focusedItem: HTMLElement, isNext: boolean, isEdgeItem = false): void {
    const siblingElement = isEdgeItem
      ? focusedItem
      : (focusedItem[isNext ? 'nextSibling' : 'previousSibling'] as HTMLElement);
    if (!siblingElement) {
      focusedItem.dispatchEvent(new MouseEvent(MOUSELEAVE));
      DropupItemNavigation.focusItemWhenOnEdge(menu, isNext);
    } else {
      focusedItem.dispatchEvent(new MouseEvent(MOUSELEAVE));
      siblingElement.dispatchEvent(new MouseEvent(MOUSEENTER));
      siblingElement.focus();
    }
  }
}
