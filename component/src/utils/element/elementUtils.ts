export class ElementUtils {
  private static readonly CODE_SNIPPET_GENERATION_JUMP = 0.5;

  public static addElements(parent: HTMLElement, ...elements: HTMLElement[]) {
    elements.forEach((element) => parent.appendChild(element));
  }

  public static isScrollbarAtBottomOfElement(element: HTMLElement) {
    // Get the scroll height, visible height, and current scroll position
    const scrollHeight = element.scrollHeight;
    const visibleHeight = element.clientHeight;
    const scrollPosition = element.scrollTop;

    // Calculate the remaining scroll height
    const remainingScrollHeight = scrollHeight - visibleHeight;

    // Check if the current scroll position is at the bottom
    return scrollPosition >= remainingScrollHeight - ElementUtils.CODE_SNIPPET_GENERATION_JUMP;
  }

  public static cloneElement(element: HTMLElement) {
    const newElement = element.cloneNode(true) as HTMLElement;
    (element.parentNode as HTMLElement).replaceChild(newElement, element);
    return newElement;
  }

  public static scrollToBottom(element: HTMLElement) {
    element.scrollTop = element.scrollHeight;
  }

  public static scrollToTop(element: HTMLElement) {
    element.scrollTop = 0;
  }
}
