import {MessageContent} from '../../../types/messages';
import {MessageElements} from './messages';

export class MessageUtils {
  public static readonly AI_ROLE = 'ai';
  public static readonly USER_ROLE = 'user';

  public static getRole(isAI: boolean) {
    return isAI ? MessageUtils.AI_ROLE : MessageUtils.USER_ROLE;
  }

  public static getLastElementsByClass(messagesElements: MessageElements[], classes: string[], avoidedClasses?: string[]) {
    for (let i = messagesElements.length - 1; i >= 0; i -= 1) {
      const elements = messagesElements[i];
      if (elements.bubbleElement.classList.contains(classes[0])) {
        const notFound = classes.slice(1).find((className) => !elements.bubbleElement.classList.contains(className));
        if (!notFound) {
          if (avoidedClasses) {
            const avoided = avoidedClasses.find((className) => elements.bubbleElement.classList.contains(className));
            if (!avoided) return elements;
          } else {
            return elements;
          }
        }
      }
    }
    return undefined;
  }

  public static getLastMessageByRole(messages: MessageContent[], isAI: boolean) {
    const role = MessageUtils.getRole(isAI);
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === role) return messages[i];
    }
    return undefined;
  }
}
