import {MessageBody, MessageBodyElements, MessageContentI, MessageToElements} from '../../../types/messagesInternal';
import {LoadingStyle} from '../../../utils/loading/loadingStyle';
import {MessageContent} from '../../../types/messages';
import {FileMessageUtils} from './fileMessageUtils';
import {HTMLMessages} from './html/htmlMessages';
import {Avatars} from '../../../types/avatars';
import {MessagesBase} from './messagesBase';
import {MessageElements} from './messages';
import {Names} from '../../../types/names';
import {Avatar} from './avatar';
import {Name} from './name';

export class MessageUtils {
  public static readonly AI_ROLE = 'ai';
  public static readonly USER_ROLE = 'user';
  private static readonly EMPTY_MESSAGE_CLASS = 'empty-message';
  private static readonly POSITION_TOP_MESSAGE_CLASS = 'deep-chat-top-message';
  private static readonly POSITION_MIDDLE_MESSAGE_CLASS = 'deep-chat-middle-message';
  private static readonly POSITION_BOTTOM_MESSAGE_CLASS = 'deep-chat-bottom-message';

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
  public static overwriteMessage(messageToElements: MessageToElements, messagesElements: MessageElements[],
      content: string, role: string, contentType: 'text' | 'html', className: string) {
    // not sure if LoadingStyle.LOADING_MESSAGE_TEXT_CLASS is needed
    const elements = MessageUtils.getLastElementsByClass(
      messagesElements, [MessageUtils.getRoleClass(role), className], [LoadingStyle.BUBBLE_CLASS]);
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

  public static buildRoleContainerClass(role: string) {
    return `deep-chat-${role}-container`;
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

  public static generateMessageBody(messageContent: MessageContentI, messageElementRefs: MessageElements[]) {
    const numberOfMessageContentElement = MessageUtils.getNumberOfElements(messageContent);
    const elements = messageElementRefs.slice(messageElementRefs.length - numberOfMessageContentElement);
    return MessageUtils.generateMessageBodyElements(messageContent, elements);
  }

  public static classifyMessages(role: string, messageElementRefs: MessageElements[]) {
    const currentRole = MessageUtils.buildRoleContainerClass(role);
    messageElementRefs.forEach((messageEls, index) => {
      const hasCurrentRole = messageEls.outerContainer.classList.contains(currentRole);

      const prevMessageEls = messageElementRefs[index - 1];
      const nextMessageEls = messageElementRefs[index + 1];

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
      }
    });
  }

  private static changeHTMLMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newHTML: string) {
    if (messageToEls[1].html) {
      HTMLMessages.overwriteElements(msg, newHTML, messageToEls[1].html);
    } else {
      const messageElements = HTMLMessages.create(msg, newHTML, messageToEls[0].role);
      const previousElements = (messageToEls[1].files?.[messageToEls[1].files?.length - 1] ||
        messageToEls[1].text) as MessageElements;
      msg.elementRef.insertBefore(messageElements.outerContainer, previousElements.outerContainer.nextSibling);
      const prevMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === previousElements);
      msg.messageElementRefs.splice(prevMsgElsIndex + 1, 0, messageElements);
      messageToEls[1].html = messageElements;
    }
    messageToEls[0].html = newHTML;
  }

  private static removeTextMessage(msg: MessagesBase, messageToEls: MessageToElements[0]) {
    const elemsToRemove = messageToEls[1].text;
    const removalElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === elemsToRemove);
    msg.messageElementRefs.splice(removalElsIndex, 1);
    elemsToRemove?.outerContainer.remove();
    delete messageToEls[0].text;
    delete messageToEls[1].text;
  }

  private static changeTextMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newText: string) {
    if (messageToEls[1].text) {
      msg.renderText(messageToEls[1].text.bubbleElement, newText);
    } else {
      const messageElements = msg.createElements(newText, messageToEls[0].role);
      const nextElements = (messageToEls[1].html || messageToEls[1].files?.[0]) as MessageElements;
      msg.elementRef.insertBefore(messageElements.outerContainer, nextElements.outerContainer);
      const nextMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === nextElements);
      msg.messageElementRefs.splice(nextMsgElsIndex, 0, messageElements);
      messageToEls[1].text = messageElements;
    }
    messageToEls[0].text = newText;
  }

  public static changeMessage(msg: MessagesBase, messageToEls: MessageToElements[0], messageBody: MessageBody) {
    if (messageToEls) {
      if (messageBody.text) {
        MessageUtils.changeTextMessage(msg, messageToEls, messageBody.text);
      } else if (messageToEls[1].text) {
        MessageUtils.removeTextMessage(msg, messageToEls);
      }
      if (messageBody.html) {
        MessageUtils.changeHTMLMessage(msg, messageToEls, messageBody.html);
      } else if (messageToEls[1].text) {
        // MessageUtils.removeTextMessage(msg, messageToEls);
      }
    } else {
      console.error('Message index not found. Please use the `getMessages` method to find the correct index');
    }
  }
}
