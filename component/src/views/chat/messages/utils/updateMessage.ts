import {MessageToElements, MessageBodyElements, MessageBody} from '../../../../types/messagesInternal';
import {ERROR, FILES, HTML, TEXT} from '../../../../utils/consts/messageConstants';
import {CLASS_LIST} from '../../../../utils/consts/htmlConstants';
import {MessageFile} from '../../../../types/messageFile';
import {MessageStyles} from '../../../../types/messages';
import {MessageElements, Messages} from '../messages';
import {FileMessageUtils} from './fileMessageUtils';
import {HTMLMessages} from '../html/htmlMessages';
import {FileMessages} from '../fileMessages';
import {MessagesBase} from '../messagesBase';
import {MessageUtils} from './messageUtils';

export class UpdateMessage {
  private static removeElements(messageElementRefs: MessageElements[], elemsToRemove?: MessageElements) {
    if (!elemsToRemove) return;
    const removalElsIndex = messageElementRefs.findIndex((messageElements) => messageElements === elemsToRemove);
    messageElementRefs.splice(removalElsIndex, 1);
    elemsToRemove?.outerContainer.remove();
  }

  private static removeFilesMessages(msg: MessagesBase, messageToEls: MessageToElements[0]) {
    messageToEls[1][FILES]?.forEach((file) => {
      UpdateMessage.removeElements(msg.messageElementRefs, file);
    });
    delete messageToEls[0][FILES];
    delete messageToEls[1][FILES];
  }

  private static removeTextHTMLMessage(msg: MessagesBase, messageToEls: MessageToElements[0], type: 'text' | 'html') {
    const elemsToRemove = messageToEls[1][type];
    UpdateMessage.removeElements(msg.messageElementRefs, elemsToRemove);
    delete messageToEls[0][type];
    delete messageToEls[1][type];
  }

  private static updateHTMLMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newHTML: string) {
    if (messageToEls[1][HTML]) {
      HTMLMessages.overwriteElements(msg, newHTML, messageToEls[1][HTML]);
    } else {
      const messageElements = HTMLMessages.create(msg, newHTML, messageToEls[0].role);
      const previousElements = (messageToEls[1][FILES]?.[messageToEls[1][FILES]?.length - 1] ||
        messageToEls[1][TEXT]) as MessageElements;
      const {nextSibling} = previousElements.outerContainer;
      nextSibling?.parentElement?.insertBefore(messageElements.outerContainer, nextSibling);
      msg.messageElementRefs.splice(msg.messageElementRefs.length - 1, 1); // removing as createMessageElements adds one
      const prevMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === previousElements);
      msg.messageElementRefs.splice(prevMsgElsIndex + 1, 0, messageElements);
      messageToEls[1][HTML] = messageElements;
    }
    messageToEls[0][HTML] = newHTML;
  }

  // finds beforeElement, creates new elements, remove old and adds new ones
  private static updateFileMessages(msg: MessagesBase, messageToEls: MessageToElements[0], newFiles: MessageFile[]) {
    const role = messageToEls[0].role;
    const typeToElements = FileMessages.createMessages(msg, newFiles, role, false);
    const nextElement = messageToEls[1][HTML];
    const prevElement = messageToEls[1][FILES]?.[messageToEls[1][FILES]?.length - 1] || messageToEls[1][TEXT];
    const siblingElement = (nextElement || prevElement) as MessageElements;
    let siblingElementIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === siblingElement);
    if (prevElement) siblingElementIndex += 1;
    const beforeElement = (nextElement?.outerContainer || prevElement?.outerContainer.nextSibling) as Node;
    typeToElements.forEach(({type, elements}, index) => {
      FileMessageUtils.setElementProps(msg, elements, type as keyof MessageStyles, role);
      beforeElement.parentElement?.insertBefore(elements.outerContainer, beforeElement);
      msg.messageElementRefs.splice(msg.messageElementRefs.length - 1, 1); // removing as createMessageElements adds one
      msg.messageElementRefs.splice(siblingElementIndex + index, 0, elements);
    });
    UpdateMessage.removeFilesMessages(msg, messageToEls);
    messageToEls[1][FILES] = typeToElements.map(({elements}) => elements);
    messageToEls[0][FILES] = newFiles;
  }

  private static updateTextMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newText: string) {
    if (messageToEls[1][TEXT]) {
      msg.renderText(messageToEls[1][TEXT].bubbleElement, newText, messageToEls[0].role);
    } else {
      const messageElements = msg.createElements(newText, messageToEls[0].role);
      const nextElements = (messageToEls[1][FILES]?.[0] || messageToEls[1][HTML]) as MessageElements;
      nextElements.outerContainer.parentElement?.insertBefore(messageElements.outerContainer, nextElements.outerContainer);
      const nextMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === nextElements);
      msg.messageElementRefs.splice(nextMsgElsIndex, 0, messageElements);
      messageToEls[1][TEXT] = messageElements;
    }
    messageToEls[0][TEXT] = newText;
  }

  private static isElementActive(elements: MessageBodyElements) {
    return (
      Messages.isActiveElement(elements[TEXT]?.bubbleElement[CLASS_LIST]) ||
      Messages.isActiveElement(elements[HTML]?.bubbleElement[CLASS_LIST])
    );
  }

  // note that overwrite and 'deep-chat-temporary-message' are used to remove a message
  public static update(msg: MessagesBase, messageBody: MessageBody, index: number) {
    const messageToEls = msg.messageToElements[index];
    if (messageToEls) {
      if (UpdateMessage.isElementActive(messageToEls[1])) {
        return console[ERROR]('Cannot update a message that is being streamed');
      }
      if (messageBody[TEXT]) {
        UpdateMessage.updateTextMessage(msg, messageToEls, messageBody[TEXT]);
      }
      if (messageBody[FILES]) {
        // adds and removes
        UpdateMessage.updateFileMessages(msg, messageToEls, messageBody[FILES]);
      } else {
        // removes elements
        UpdateMessage.removeFilesMessages(msg, messageToEls);
      }
      if (messageBody[HTML]) {
        UpdateMessage.updateHTMLMessage(msg, messageToEls, messageBody[HTML]);
      }
      // Important to remove after elements are changed as existing element indexes are used
      if (!messageBody[TEXT] && messageToEls[1][TEXT]) {
        UpdateMessage.removeTextHTMLMessage(msg, messageToEls, TEXT);
      }
      if (!messageBody[HTML] && messageToEls[1][HTML]) {
        UpdateMessage.removeTextHTMLMessage(msg, messageToEls, HTML);
      }
      const {messageElementRefs, avatar, name} = msg;
      MessageUtils.classifyRoleMessages(messageElementRefs);
      MessageUtils.resetAllRoleElements(messageElementRefs, avatar, name);
    } else {
      console[ERROR]('Message index not found. Please use the `getMessages` method to find the correct index');
    }
  }
}
