import {StyleUtils} from '../../../../utils/element/styleUtils';
import {HTMLClassUtilities} from '../../../../types/html';
import {StatefulStyles} from '../../../../types/styles';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {HTMLUtils} from './htmlUtils';

const DEEP_CHAT_TEMPORARY_MESSAGE = 'deep-chat-temporary-message';
const DEEP_CHAT_SUGGESTION_BUTTON = 'deep-chat-suggestion-button';

const DEEP_CHAT_ELEMENTS: HTMLClassUtilities = {
  'deep-chat-button': {
    styles: {
      default: {
        backgroundColor: 'white',
        padding: '5px',
        paddingLeft: '7px',
        paddingRight: '7px',
        border: '1px solid #c2c2c2',
        borderRadius: '6px',
        cursor: 'pointer',
      },
      hover: {
        backgroundColor: '#fafafa',
      },
      click: {
        backgroundColor: '#f1f1f1',
      },
    },
  },
};

const DEEP_CHAT_ELEMENT_CLASSES = Object.keys(DEEP_CHAT_ELEMENTS);

export class HTMLDeepChatElements {
  private static applySuggestionEvent(messages: MessagesBase, element: Element) {
    // needs to be in a timeout for submitMessage to be available
    setTimeout(() => {
      element.addEventListener('click', () => {
        messages.submitUserMessage?.({text: element.textContent?.trim() || ''});
      });
    });
  }

  public static isElementTemporary(messageElements?: MessageElements) {
    if (!messageElements) return false;
    return messageElements.bubbleElement.children[0]?.classList.contains(DEEP_CHAT_TEMPORARY_MESSAGE);
  }

  public static doesElementContainDeepChatClass(element: HTMLElement) {
    return DEEP_CHAT_ELEMENT_CLASSES.find((className) => element.classList.contains(className));
  }

  private static applyEvents(element: Element, className: string) {
    const events = DEEP_CHAT_ELEMENTS[className].events;
    Object.keys(events || []).forEach((eventType) => {
      element.addEventListener(eventType, events?.[eventType as keyof GlobalEventHandlersEventMap] as () => void);
    });
  }

  private static getProcessedStyles(utilities: HTMLClassUtilities, element: Element, className: string) {
    const customStyles = Array.from(element.classList).reduce<StatefulStyles[]>((styles, className) => {
      const statefulStyles = utilities[className]?.styles as StatefulStyles;
      if (statefulStyles && utilities[className].styles) {
        styles.push(statefulStyles);
      }
      return styles;
    }, []);
    const deepChatStyles = DEEP_CHAT_ELEMENTS[className].styles;
    if (deepChatStyles) {
      const stylesCp = JSON.parse(JSON.stringify(deepChatStyles));
      if (stylesCp.default) StyleUtils.overwriteDefaultWithAlreadyApplied(stylesCp, element as HTMLElement);
      customStyles.unshift(stylesCp); // add it to the front to be primary
    }
    const mergedStyles = StyleUtils.mergeStatefulStyles(customStyles);
    return StyleUtils.processStateful(mergedStyles, {}, {});
  }

  public static applyDeepChatUtilities(messages: MessagesBase, utilities: HTMLClassUtilities, element: HTMLElement) {
    DEEP_CHAT_ELEMENT_CLASSES.forEach((className) => {
      const elements = element.getElementsByClassName(className);
      Array.from(elements || []).forEach((element) => {
        const styles = HTMLDeepChatElements.getProcessedStyles(utilities, element, className);
        HTMLUtils.applyStylesToElement(element as HTMLElement, styles);
        HTMLDeepChatElements.applyEvents(element, className);
      });
    });
    const suggestionElements = element.getElementsByClassName(DEEP_CHAT_SUGGESTION_BUTTON);
    Array.from(suggestionElements).forEach((element) => HTMLDeepChatElements.applySuggestionEvent(messages, element));
  }
}
