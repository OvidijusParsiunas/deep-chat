export class DropupItemNavigation {
  private static focusItemWhenOnEdge(dropupElement: HTMLElement, isNext: boolean) {
    const nextItem = isNext ? dropupElement.children[0] : dropupElement.children[dropupElement.children.length - 1];
    DropupItemNavigation.focusSiblingItem(nextItem as HTMLElement, dropupElement, isNext, true);
  }

  // isEdgeItem means is it a start or end item
  // prettier-ignore
  public static focusSiblingItem(focusedItem: HTMLElement,
      dropupElement: HTMLElement, isNext: boolean, isEdgeItem = false): void {
    const siblingElement = isEdgeItem
      ? focusedItem : (focusedItem[isNext ? 'nextSibling' : 'previousSibling'] as HTMLElement);
    if (!siblingElement) {
      focusedItem.dispatchEvent(new MouseEvent('mouseleave'));
      DropupItemNavigation.focusItemWhenOnEdge(dropupElement, isNext);
    } else {
      focusedItem.dispatchEvent(new MouseEvent('mouseleave'));
      siblingElement.dispatchEvent(new MouseEvent('mouseenter'));
    }
    
  }
}
