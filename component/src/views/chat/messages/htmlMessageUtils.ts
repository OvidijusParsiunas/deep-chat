import {StatefulEvents} from '../../../utils/element/statefulEvents';
import {StyleUtils} from '../../../utils/element/styleUtils';
import {EventToFunction} from '../../../types/html';
import {Messages} from './messages';

export class HTMLMessageUtils {
  public static addNewHTMLMessage(messages: Messages, html: string, isAI: boolean, update: boolean, isInitial = false) {
    // const messageElements = this.createAndAppendNewMessageElement('', isAI);
    // this.applyCustomStyles(messageElements, isAI, false);
    const element = messages.createNewMessageElement('', isAI);
    element.bubbleElement.style.maxWidth = 'unset';
    element.bubbleElement.innerHTML = html;
    messages.elementRef.appendChild(element.outerContainer);
    messages.elementRef.scrollTop = messages.elementRef.scrollHeight;
    const messageContent = Messages.createMessageContent(isAI, {html});
    // if (text.trim().length === 0) Messages.editEmptyMessageElement(messageElements.bubbleElement);
    if (!isInitial) messages.messages.push(messageContent);
    if (update) messages.sendClientUpdate(messageContent, isInitial);
    // return messageElements;
    Object.keys(messages._htmlClassUtilities).forEach((className) => {
      const elements = element.outerContainer.getElementsByClassName(className);
      (Array.from(elements) as HTMLElement[]).forEach((element) => {
        const events = messages._htmlClassUtilities[className as string]?.events;
        if (events) {
          Object.keys(events).forEach((event) => {
            const eventFunction = events[event as keyof EventToFunction];
            if (eventFunction) element.addEventListener(event as keyof EventToFunction, eventFunction);
          });
        }
        const styles = messages._htmlClassUtilities[className as string]?.styles;
        if (styles) {
          const statefulStyles = StyleUtils.processStateful(styles, {}, {});
          StatefulEvents.add(element, statefulStyles);
          Object.assign(element.style, statefulStyles.default);
        }
      });
    });
    return element;
  }
}
