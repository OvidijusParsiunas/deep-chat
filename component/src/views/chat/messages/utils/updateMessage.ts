import {MessageToElements, MessageBodyElements, MessageBody} from '../../../../types/messagesInternal';
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
    messageToEls[1].files?.forEach((file) => {
      UpdateMessage.removeElements(msg.messageElementRefs, file);
    });
    delete messageToEls[0].files;
    delete messageToEls[1].files;
  }

  private static removeTextHTMLMessage(msg: MessagesBase, messageToEls: MessageToElements[0], type: 'text' | 'html') {
    const elemsToRemove = messageToEls[1][type];
    UpdateMessage.removeElements(msg.messageElementRefs, elemsToRemove);
    delete messageToEls[0][type];
    delete messageToEls[1][type];
  }

  private static updateHTMLMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newHTML: string) {
    if (messageToEls[1].html) {
      HTMLMessages.overwriteElements(msg, newHTML, messageToEls[1].html);
    } else {
      const messageElements = HTMLMessages.create(msg, newHTML, messageToEls[0].role);
      const previousElements = (messageToEls[1].files?.[messageToEls[1].files?.length - 1] ||
        messageToEls[1].text) as MessageElements;
      const {nextSibling} = previousElements.outerContainer;
      nextSibling?.parentElement?.insertBefore(messageElements.outerContainer, nextSibling);
      msg.messageElementRefs.splice(msg.messageElementRefs.length - 1, 1); // removing as createMessageElements adds one
      const prevMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === previousElements);
      msg.messageElementRefs.splice(prevMsgElsIndex + 1, 0, messageElements);
      messageToEls[1].html = messageElements;
    }
    messageToEls[0].html = newHTML;
  }

  // finds beforeElement, creates new elements, remove old and adds new ones
  private static updateFileMessages(msg: MessagesBase, messageToEls: MessageToElements[0], newFiles: MessageFile[]) {
    const role = messageToEls[0].role;
    const typeToElements = FileMessages.createMessages(msg, newFiles, role);
    const nextElement = messageToEls[1].html;
    const prevElement = messageToEls[1].files?.[messageToEls[1].files?.length - 1] || messageToEls[1].text;
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
    messageToEls[1].files = typeToElements.map(({elements}) => elements);
    messageToEls[0].files = newFiles;
  }

  private static updateTextMessage(msg: MessagesBase, messageToEls: MessageToElements[0], newText: string) {
    if (messageToEls[1].text) {
      msg.renderText(messageToEls[1].text.bubbleElement, newText);
    } else {
      const messageElements = msg.createElements(newText, messageToEls[0].role);
      const nextElements = (messageToEls[1].files?.[0] || messageToEls[1].html) as MessageElements;
      nextElements.outerContainer.parentElement?.insertBefore(messageElements.outerContainer, nextElements.outerContainer);
      const nextMsgElsIndex = msg.messageElementRefs.findIndex((messageElements) => messageElements === nextElements);
      msg.messageElementRefs.splice(nextMsgElsIndex, 0, messageElements);
      messageToEls[1].text = messageElements;
    }
    messageToEls[0].text = newText;
  }

  private static isElementActive(elements: MessageBodyElements) {
    return (
      Messages.isActiveElement(elements.text?.bubbleElement.classList) ||
      Messages.isActiveElement(elements.html?.bubbleElement.classList)
    );
  }

  // note that overwrite and 'deep-chat-temporary-message' are used to remove a message
  public static update(msg: MessagesBase, messageBody: MessageBody, index: number) {
    const messageToEls = msg.messageToElements[index];
    if (messageToEls) {
      if (UpdateMessage.isElementActive(messageToEls[1])) {
        return console.error('Cannot update a message that is being streamed');
      }
      if (messageBody.text) {
        UpdateMessage.updateTextMessage(msg, messageToEls, messageBody.text);
      }
      if (messageBody.files) {
        // adds and removes
        UpdateMessage.updateFileMessages(msg, messageToEls, messageBody.files);
      } else {
        // removes elements
        UpdateMessage.removeFilesMessages(msg, messageToEls);
      }
      if (messageBody.html) {
        UpdateMessage.updateHTMLMessage(msg, messageToEls, messageBody.html);
      }
      // Important to remove after elements are changed as existing element indexes are used
      if (!messageBody.text && messageToEls[1].text) {
        UpdateMessage.removeTextHTMLMessage(msg, messageToEls, 'text');
      }
      if (!messageBody.html && messageToEls[1].html) {
        UpdateMessage.removeTextHTMLMessage(msg, messageToEls, 'html');
      }
      const {messageElementRefs, avatar, name} = msg;
      MessageUtils.classifyRoleMessages(messageElementRefs);
      MessageUtils.resetAllRoleElements(messageElementRefs, avatar, name);
    } else {
      console.error('Message index not found. Please use the `getMessages` method to find the correct index');
    }
  }
}
