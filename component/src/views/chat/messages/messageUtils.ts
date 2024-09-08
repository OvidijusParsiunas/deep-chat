import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {MessageContentI} from '../../../types/messagesInternal';
import {MessageContent} from '../../../types/messages';
import {Avatars} from '../../../types/avatars';
import {MessageElements} from './messages';
import {Names} from '../../../types/names';
import {Avatar} from './avatar';
import {Name} from './name';

export class MessageUtils {
  public static readonly AI_ROLE = 'ai';
  public static readonly USER_ROLE = 'user';
  private static readonly EMPTY_MESSAGE_CLASS = 'empty-message';

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

  public static getLastMessage(messages: MessageContentI[], role: string, content?: keyof Omit<MessageContent, 'role'>) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === role) {
        if (content) {
          if (messages[i][content]) return messages[i];
        } else {
          return messages[i];
        }
      }
    }
    return undefined;
  }

  public static getLastTextToElement(elemsToText: [MessageElements, string][], elems: MessageElements) {
    for (let i = elemsToText.length - 1; i >= 0; i -= 1) {
      if (elemsToText[i][0] === elems) {
        return elemsToText[i];
      }
    }
    return undefined;
  }

  // IMPORTANT: If the overwrite message does not contain a role property it will look for the last 'ai' role message
  // and if messages have custom roles, it will still look to update the last 'ai' role message
  // prettier-ignore
  public static overwriteMessage(messages: MessageContentI[], messagesElements: MessageElements[],
      content: string, role: string, contentType: 'text' | 'html', className: string) {
    // not sure if LoadingStyle.LOADING_MESSAGE_TEXT_CLASS is needed
    const elements = MessageUtils.getLastElementsByClass(
      messagesElements, [MessageUtils.getRoleClass(role), className], [LoadingStyle.BUBBLE_CLASS]);
    const lastMessage = MessageUtils.getLastMessage(messages, role, contentType);
    if (lastMessage) lastMessage[contentType] = content;
    return elements;
  }

  public static getRoleClass(role: string) {
    return `${role}-message`;
  }

  // makes sure the bubble has dimensions when there is no text
  public static fillEmptyMessageElement(bubbleElement: HTMLElement, content: string) {
    if (content.trim().length === 0) {
      bubbleElement.classList.add(MessageUtils.EMPTY_MESSAGE_CLASS);
      bubbleElement.innerHTML = '<div style="color:#00000000">.</div>';
    }
  }

  public static unfillEmptyMessageElement(bubbleElement: HTMLElement, newContent: string) {
    if (bubbleElement.classList.contains(MessageUtils.EMPTY_MESSAGE_CLASS) && newContent.trim().length > 0) {
      bubbleElement.replaceChildren();
    }
  }

  public static getLastMessageBubbleElement(messagesEl: HTMLElement) {
    return Array.from(MessageUtils.getLastMessageElement(messagesEl)?.children?.[0]?.children || []).find((element) => {
      return element.classList.contains('message-bubble');
    });
  }

  public static getLastMessageElement(messagesEl: HTMLElement) {
    return messagesEl.children[messagesEl.children.length - 1];
  }

  public static addRoleElements(bubbleElement: HTMLElement, role: string, avatars?: Avatars, names?: Names) {
    if (avatars) Avatar.add(bubbleElement, role, avatars);
    if (names) Name.add(bubbleElement, role, names);
  }

  public static hideRoleElements(messageElementRefs: MessageElements[], avatars: boolean, names: boolean) {
    const innerContainer = messageElementRefs[messageElementRefs.length - 1].innerContainer;
    if (avatars) Avatar.hide(innerContainer);
    if (names) Name.hide(innerContainer);
  }

  public static revealRoleElements(innerContainer: HTMLElement, avatars?: Avatars, names?: Names) {
    if (avatars) Avatar.reveal(innerContainer);
    if (names) Name.reveal(innerContainer);
  }

  public static updateRefArr<T>(arr: Array<T>, item: T, isTop: boolean) {
    if (isTop) {
      arr.unshift(item);
    } else {
      arr.push(item);
    }
  }
}
