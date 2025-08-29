import {EventToFunction, HTMLClassUtility, HTMLClassUtilities} from '../../../../types/html';
import {StatefulEvents} from '../../../../utils/element/statefulEvents';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {HTMLDeepChatElements} from './htmlDeepChatElements';
import {StatefulStyles} from '../../../../types/styles';
import {HTMLWrappers} from '../../../../types/stream';
import {MessagesBase} from '../messagesBase';

export class HTMLUtils {
  static readonly TARGET_WRAPPER_CLASS = 'html-wrapper';

  public static applyStylesToElement(element: HTMLElement, styles: StatefulStyles) {
    const statefulStyles = StyleUtils.processStateful(styles);
    StatefulEvents.add(element, statefulStyles);
    Object.assign(element.style, statefulStyles.default);
  }

  private static applyEventsToElement(element: HTMLElement, events: EventToFunction) {
    Object.keys(events).forEach((event) => {
      const eventFunction = events[event];
      if (eventFunction) element.addEventListener(event, eventFunction as () => void);
    });
  }

  private static applyClassUtilitiesToElement(element: HTMLElement, classUtility: HTMLClassUtility) {
    const {events, styles} = classUtility;
    if (events) HTMLUtils.applyEventsToElement(element, events);
    // if deep chat class then style was already applied
    if (styles && !HTMLDeepChatElements.doesElementContainDeepChatClass(element)) {
      HTMLUtils.applyStylesToElement(element, styles);
    }
  }

  private static applyCustomClassUtilities(utilities: HTMLClassUtilities, element: HTMLElement) {
    Object.keys(utilities).forEach((className) => {
      const elements = element.getElementsByClassName(className);
      (Array.from(elements) as HTMLElement[]).forEach((element) => {
        if (utilities[className as string]) {
          HTMLUtils.applyClassUtilitiesToElement(element, utilities[className as string]);
        }
      });
    });
  }

  public static apply(messages: MessagesBase, outmostElement: HTMLElement) {
    HTMLDeepChatElements.applyDeepChatUtilities(messages, messages.htmlClassUtilities, outmostElement);
    HTMLUtils.applyCustomClassUtilities(messages.htmlClassUtilities, outmostElement);
  }

  private static traverseNodes(node: ChildNode, topLevelElements: string[]) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      topLevelElements.push((node as HTMLElement).outerHTML);
    }
    node.childNodes.forEach((childNode) => {
      HTMLUtils.traverseNodes(childNode, topLevelElements);
    });
  }

  public static splitHTML(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const topLevelElements: string[] = [];
    doc.body.childNodes.forEach((childNode) => {
      HTMLUtils.traverseNodes(childNode, topLevelElements);
    });
    return topLevelElements;
  }

  public static isTemporaryBasedOnHTML(html: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return HTMLDeepChatElements.isElementTemporary({
      outerContainer: tempDiv,
      bubbleElement: tempDiv,
      innerContainer: tempDiv,
    });
  }

  // useful for removing event listeners
  public static replaceElementWithNewClone(oldElement: HTMLElement, elementToBeCloned?: HTMLElement) {
    const newElement = (elementToBeCloned || oldElement).cloneNode(true) as HTMLElement;
    oldElement.parentNode?.replaceChild(newElement, oldElement);
    return newElement;
  }

  public static tryAddWrapper(bubbleElement: HTMLElement, content: string, wrappers?: HTMLWrappers, role?: string) {
    if (content && role) {
      const customWrapper = wrappers?.[role] || wrappers?.['default'];
      if (customWrapper) {
        bubbleElement.innerHTML = customWrapper;
        return {contentEl: HTMLUtils.getTargetWrapper(bubbleElement), wrapper: true};
      }
    }
    return {contentEl: bubbleElement, wrapper: false};
  }

  public static getTargetWrapper(bubbleElement: HTMLElement) {
    return (bubbleElement.getElementsByClassName(HTMLUtils.TARGET_WRAPPER_CLASS)[0] || bubbleElement) as HTMLElement;
  }
}
