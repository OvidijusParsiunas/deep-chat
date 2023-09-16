import {MessageContent} from '../../types/messages';
import {RequestContents} from '../serviceIO';

export class MessageLimitUtils {
  public static getCharacterLimitMessages(messages: MessageContent[], limit: number) {
    let totalCharacters = 0;
    let i = messages.length - 1;
    for (i; i >= 0; i -= 1) {
      const text = messages[i]?.text;
      if (text !== undefined) {
        totalCharacters += text.length;
        if (totalCharacters > limit) {
          messages[i].text = text.substring(0, text.length - (totalCharacters - limit));
          break;
        }
      }
    }
    return messages.slice(Math.max(i, 0));
  }

  private static getRequestMessages(requestContents: RequestContents, messages: MessageContent[]) {
    const requestMessages = [];
    let numberOfFilesToFind = requestContents.files?.length || 0;
    let searchingForText = !!requestContents.text;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      requestMessages.push(message);
      if (message.file) {
        numberOfFilesToFind -= 1;
      } else if (message.text) {
        searchingForText = false;
      }
      if (numberOfFilesToFind === 0 && !searchingForText) break;
    }
    return requestMessages;
  }

  private static getMaxMessages(messages: MessageContent[], maxMessages: number) {
    return messages.slice(Math.max(messages.length - maxMessages, 0));
  }

  // prettier-ignore
  // if maxMessages is not defined we send all messages
  // if maxMessages above 0 we send that number
  // if maxMessages 0 or below we send only what is in the request
  public static processMessages(requestContents: RequestContents, messages: MessageContent[],
      maxMessages?: number, totalMessagesMaxCharLength?: number) {
    if (maxMessages !== undefined) {
      if (maxMessages > 0) messages = MessageLimitUtils.getMaxMessages(messages, maxMessages);
    } else {
      messages = MessageLimitUtils.getRequestMessages(requestContents, messages);
    }
    messages = JSON.parse(JSON.stringify(messages));
    if (totalMessagesMaxCharLength === undefined) return messages;
    return MessageLimitUtils.getCharacterLimitMessages(messages, totalMessagesMaxCharLength);
  }
}
