import {MessageBodyElements, MessageContentI, MessageToElements} from '../../../../types/messagesInternal';
import {LoadingStyle} from '../../../../utils/loading/loadingStyle';
import {MessageContent} from '../../../../types/messages';
import {FileMessageUtils} from './fileMessageUtils';
import {HTMLMessages} from '../html/htmlMessages';
import {MessagesBase} from '../messagesBase';
import {MessageElements} from '../messages';
import {Avatar} from '../avatar';
import {Name} from '../name';

export class MessageUtils {
  public static readonly AI_ROLE = 'ai';
  public static readonly USER_ROLE = 'user';
  public static readonly ERROR_MESSAGE_TEXT_CLASS = 'error-message-text';
  public static readonly OUTER_CONTAINER_CLASS_ROLE_PREFIX = 'deep-chat-outer-container-role-';
  private static readonly EMPTY_MESSAGE_CLASS = 'empty-message';
  private static readonly POSITION_TOP_MESSAGE_CLASS = 'deep-chat-top-message';
  private static readonly POSITION_MIDDLE_MESSAGE_CLASS = 'deep-chat-middle-message';
  private static readonly POSITION_BOTTOM_MESSAGE_CLASS = 'deep-chat-bottom-message';

  public static getLastElementsByClass(messageElementRefs: MessageElements[], classes: string[], avoidClasses?: string[]) {
    for (let i = messageElementRefs.length - 1; i >= 0; i -= 1) {
      const elements = messageElementRefs[i];
      if (elements.bubbleElement.classList.contains(classes[0])) {
        const notFound = classes.slice(1).find((className) => !elements.bubbleElement.classList.contains(className));
        if (!notFound) {
          if (avoidClasses) {
            const avoided = avoidClasses.find((className) => elements.bubbleElement.classList.contains(className));
            if (!avoided) return elements;
          } else {
            return elements;
          }
        }
      }
    }
    return undefined;
  }

  public static getLastMessage(msgToEls: MessageToElements, role: string, content?: keyof Omit<MessageContent, 'role'>) {
    for (let i = msgToEls.length - 1; i >= 0; i -= 1) {
      if (msgToEls[i][0].role === role) {
        if (content) {
          if (msgToEls[i][0][content]) return msgToEls[i][0];
        } else {
          return msgToEls[i][0];
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
  public static overwriteMessage(messageToElements: MessageToElements, messageElementRefs: MessageElements[],
      content: string, role: string, contentType: 'text' | 'html', className: string) {
    // not sure if LoadingStyle.LOADING_MESSAGE_TEXT_CLASS is needed
    const elements = MessageUtils.getLastElementsByClass(
      messageElementRefs, [MessageUtils.getRoleClass(role), className], [LoadingStyle.BUBBLE_CLASS]);
    const lastMessage = MessageUtils.getLastMessage(messageToElements, role, contentType);
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

  public static addRoleElements(bubbleElement: HTMLElement, role: string, avatar?: Avatar, name?: Name) {
    avatar?.addBesideMsg(bubbleElement, role);
    name?.addBesideMsg(bubbleElement, role);
  }

  public static hideRoleElements(innerContainer: HTMLElement, avatar?: Avatar, name?: Name) {
    avatar?.tryHide(innerContainer);
    name?.tryHide(innerContainer);
  }

  public static revealRoleElements(innerContainer: HTMLElement, avatar?: Avatar, name?: Name) {
    avatar?.tryReveal(innerContainer);
    name?.tryReveal(innerContainer);
  }

  public static softRemRoleElements(innerContainer: HTMLElement, avatar?: Avatar, name?: Name) {
    avatar?.trySoftRem(innerContainer);
    name?.trySoftRem(innerContainer);
  }

  public static updateRefArr<T>(arr: Array<T>, item: T, isTop: boolean) {
    if (isTop) {
      arr.unshift(item);
    } else {
      arr.push(item);
    }
  }

  public static buildRoleOuterContainerClass(role: string) {
    return `${MessageUtils.OUTER_CONTAINER_CLASS_ROLE_PREFIX}${role}`;
  }

  private static addNewPositionClasses(messageEls: MessageElements, classes: string[]) {
    messageEls.outerContainer.classList.remove(
      MessageUtils.POSITION_TOP_MESSAGE_CLASS,
      MessageUtils.POSITION_MIDDLE_MESSAGE_CLASS,
      MessageUtils.POSITION_BOTTOM_MESSAGE_CLASS
    );
    messageEls.outerContainer.classList.add(...classes);
  }

  private static getNumberOfElements(messageContent: MessageContentI) {
    let length = 0;
    if (messageContent.text !== undefined) length += 1;
    if (messageContent.html !== undefined) length += 1;
    if (messageContent.files) length += messageContent.files.length;
    return length;
  }

  private static filterdMessageElements(elements: MessageElements[], className: string) {
    return elements.filter((msgElements) => msgElements.bubbleElement.classList.contains(className));
  }

  private static findMessageElements(elements: MessageElements[], className: string) {
    return elements.find((msgElements) => msgElements.bubbleElement.classList.contains(className));
  }

  private static generateMessageBodyElements(messageContent: MessageContentI, elements: MessageElements[]) {
    const msgBodyEls: MessageBodyElements = {};
    if (messageContent.text) msgBodyEls.text = MessageUtils.findMessageElements(elements, MessagesBase.TEXT_BUBBLE_CLASS);
    if (messageContent.html) msgBodyEls.html = MessageUtils.findMessageElements(elements, HTMLMessages.HTML_BUBBLE_CLASS);
    if (messageContent.files) {
      msgBodyEls.files = MessageUtils.filterdMessageElements(elements, FileMessageUtils.FILE_BUBBLE_CLASS);
    }
    return msgBodyEls;
  }

  public static generateMessageBody(messageContent: MessageContentI, messageElementRefs: MessageElements[], top = false) {
    const numberOfMessageContentElement = MessageUtils.getNumberOfElements(messageContent);
    const elements = top
      ? messageElementRefs.slice(0, numberOfMessageContentElement)
      : messageElementRefs.slice(messageElementRefs.length - numberOfMessageContentElement);
    return MessageUtils.generateMessageBodyElements(messageContent, elements);
  }

  // if role not present - traverse all, if present - traverse last messages
  public static classifyRoleMessages(messageElementRefs: MessageElements[], role?: string) {
    let currentRole = role ? MessageUtils.buildRoleOuterContainerClass(role) : undefined;
    for (let i = messageElementRefs.length - 1; i >= 0; i -= 1) {
      if (!role) {
        currentRole = Array.from(messageElementRefs[i].outerContainer.classList).find((className) =>
          className.startsWith(MessageUtils.OUTER_CONTAINER_CLASS_ROLE_PREFIX)
        );
      }
      if (!currentRole) continue; // will always be true if role is available
      const messageEls = messageElementRefs[i];
      const hasCurrentRole = messageEls.outerContainer.classList.contains(currentRole);

      const prevMessageEls = messageElementRefs[i - 1];
      const nextMessageEls = messageElementRefs[i + 1];

      const hasPrevRole = prevMessageEls?.outerContainer.classList.contains(currentRole);
      const hasNextRole = nextMessageEls?.outerContainer.classList.contains(currentRole);

      if (hasCurrentRole) {
        if (!hasPrevRole && hasNextRole) {
          MessageUtils.addNewPositionClasses(messageEls, [MessageUtils.POSITION_TOP_MESSAGE_CLASS]);
        } else if (hasPrevRole && hasNextRole) {
          MessageUtils.addNewPositionClasses(messageEls, [MessageUtils.POSITION_MIDDLE_MESSAGE_CLASS]);
        } else if (hasPrevRole && !hasNextRole) {
          MessageUtils.addNewPositionClasses(messageEls, [MessageUtils.POSITION_BOTTOM_MESSAGE_CLASS]);
        } else if (!hasPrevRole && !hasNextRole) {
          MessageUtils.addNewPositionClasses(messageEls, [
            MessageUtils.POSITION_TOP_MESSAGE_CLASS,
            MessageUtils.POSITION_BOTTOM_MESSAGE_CLASS,
          ]);
        }
      } else if (role) {
        break;
      }
    }
  }

  public static areOuterContainerClassRolesSame(comparedRole: string, message?: MessageElements) {
    if (!message) return false;
    const currentRoleClass = Array.from(message.outerContainer.classList).find((className) =>
      className.startsWith(MessageUtils.OUTER_CONTAINER_CLASS_ROLE_PREFIX)
    );
    return currentRoleClass === MessageUtils.buildRoleOuterContainerClass(comparedRole);
  }

  public static resetAllRoleElements(messageElementRefs: MessageElements[], avatar?: Avatar, name?: Name) {
    if (!avatar && !name) return;
    let lastRoleClass: string | undefined = '';
    messageElementRefs.forEach((message, index) => {
      if (!message.bubbleElement.classList.contains(MessageUtils.ERROR_MESSAGE_TEXT_CLASS)) {
        MessageUtils.revealRoleElements(message.innerContainer, avatar, name);
      }
      const currentRoleClass = Array.from(message.outerContainer.classList).find((className) =>
        className.startsWith(MessageUtils.OUTER_CONTAINER_CLASS_ROLE_PREFIX)
      );
      if (lastRoleClass === currentRoleClass) {
        MessageUtils.hideRoleElements(messageElementRefs[index - 1].innerContainer, avatar, name);
      }
      lastRoleClass = currentRoleClass;
    });
  }
}
