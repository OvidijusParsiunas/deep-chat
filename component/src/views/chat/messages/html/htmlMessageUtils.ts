import {EventToFunction, HTMLClassUtility, HTMLClassUtilities} from '../../../../types/html';
import {StatefulEvents} from '../../../../utils/element/statefulEvents';
import {StyleUtils} from '../../../../utils/element/styleUtils';
import {HTMLDeepChatElements} from './htmlDeepChatElements';
import {StatefulStyles} from '../../../../types/styles';
import {Messages} from '../messages';

export class HTMLMessageUtils {
  public static applyStylesToElement(element: HTMLElement, styles: StatefulStyles) {
    const statefulStyles = StyleUtils.processStateful(styles, {}, {});
    StatefulEvents.add(element, statefulStyles);
    Object.assign(element.style, statefulStyles.default);
  }

  private static applyEventsToElement(element: HTMLElement, events: EventToFunction) {
    Object.keys(events).forEach((event) => {
      const eventFunction = events[event as keyof EventToFunction];
      if (eventFunction) element.addEventListener(event as keyof EventToFunction, eventFunction as () => void);
    });
  }

  private static applyClassUtilitiesToElement(element: HTMLElement, classUtility: HTMLClassUtility) {
    const {events, styles} = classUtility;
    if (events) HTMLMessageUtils.applyEventsToElement(element, events);
    // if deep chat class then style was already applied
    if (styles && !HTMLDeepChatElements.doesElementContainDeepChatClass(element)) {
      HTMLMessageUtils.applyStylesToElement(element, styles);
    }
  }

  private static applyCustomClassUtilities(utilities: HTMLClassUtilities, element: HTMLElement) {
    Object.keys(utilities).forEach((className) => {
      const elements = element.getElementsByClassName(className);
      (Array.from(elements) as HTMLElement[]).forEach((element) => {
        if (utilities[className as string]) {
          HTMLMessageUtils.applyClassUtilitiesToElement(element, utilities[className as string]);
        }
      });
    });
  }

  public static apply(messages: Messages, outerElement: HTMLElement) {
    HTMLDeepChatElements.applyDeepChatUtilities(messages, messages._htmlClassUtilities, outerElement);
    HTMLMessageUtils.applyCustomClassUtilities(messages._htmlClassUtilities, outerElement);
  }
}
