import {StyleUtils} from '../../../../utils/element/styleUtils';
import {HTMLClassUtilities} from '../../../../types/html';
import {StatefulStyles} from '../../../../types/styles';
import {HTMLMessageUtils} from './htmlMessageUtils';
import {Messages} from '../messages';

const DEEP_CHAT_ELEMENTS: HTMLClassUtilities = {
  'deep-chat-suggestion-button': {
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
  public static doesElementContainDeepChatClass(element: HTMLElement) {
    return DEEP_CHAT_ELEMENT_CLASSES.find((className) => element.classList.contains(className));
  }

  private static applyCustomSuggestionEvent(messages: Messages, element: Element) {
    // needs to be in a timeout for submitMessage to be available
    setTimeout(() => {
      element.addEventListener('click', () => {
        messages.submitUserMessage?.(element.textContent?.trim() || '');
      });
    });
  }

  private static applyEvents(messages: Messages, element: Element, className: string) {
    const events = DEEP_CHAT_ELEMENTS[className].events;
    Object.keys(events || []).forEach((eventType) => {
      element.addEventListener(eventType, events?.[eventType as keyof GlobalEventHandlersEventMap] as () => void);
    });
    if (className === 'deep-chat-suggestion-button') {
      HTMLDeepChatElements.applyCustomSuggestionEvent(messages, element);
    }
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
    if (deepChatStyles) customStyles.unshift(deepChatStyles); // add it to the front to be primary
    const mergedStyles = StyleUtils.mergeStatefulStyles(customStyles);
    return StyleUtils.processStateful(mergedStyles, {}, {});
  }

  public static applyDeepChatUtilities(messages: Messages, utilities: HTMLClassUtilities, element: HTMLElement) {
    DEEP_CHAT_ELEMENT_CLASSES.forEach((className) => {
      const elements = element.getElementsByClassName(className);
      Array.from(elements || []).forEach((element) => {
        const styles = HTMLDeepChatElements.getProcessedStyles(utilities, element, className);
        HTMLMessageUtils.applyStylesToElement(element as HTMLElement, styles);
        HTMLDeepChatElements.applyEvents(messages, element, className);
      });
    });
  }
}
