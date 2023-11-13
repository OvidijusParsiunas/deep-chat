import {MessageContentI} from '../../../types/messagesInternal';
import {MessageContent} from '../../../types/messages';
import {MessageElements} from './messages';

export class MessageUtils {
  public static readonly AI_ROLE = 'ai';
  public static readonly USER_ROLE = 'user';

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

  public static getLastMessage(messages: MessageContentI[], isAI: boolean, content?: keyof Omit<MessageContent, 'role'>) {
    const isRoleFunc = isAI
      ? (role: string) => role !== MessageUtils.USER_ROLE
      : (role: string) => role === MessageUtils.USER_ROLE;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (isRoleFunc(messages[i].role)) {
        if (content) {
          if (messages[i][content]) return messages[i];
        } else {
          return messages[i];
        }
      }
    }
    return undefined;
  }
}
