import {MessagesBase} from '../../views/chat/messages/messagesBase';

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

  public static scrollToBottom(message: MessagesBase, isAnimation = false, targetElement?: HTMLElement) {
    if (message.hiddenMessages && message.hiddenMessages.hiddenElements.size > 0) message.hiddenMessages.clear();
    if (targetElement) {
      // scrolls targetElement.offsetTop to be at top of visible chat
      message.elementRef.scrollTo({left: 0, top: targetElement.offsetTop});
    } else if (isAnimation) {
      message.elementRef.scrollTo({left: 0, top: message.elementRef.scrollHeight, behavior: 'smooth'});
    } else {
      message.elementRef.scrollTop = message.elementRef.scrollHeight;
    }
  }

  public static scrollToTop(element: HTMLElement) {
    element.scrollTop = 0;
  }

  public static isVisibleInParent(element: HTMLElement, parent: HTMLElement) {
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    // Check if element is at least partially within parent vertically
    return elementRect.bottom > parentRect.top && elementRect.top < parentRect.bottom;
  }
}
