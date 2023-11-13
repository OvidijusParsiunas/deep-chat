import {MessageContentI} from '../../types/messagesInternal';

export class MessageLimitUtils {
  public static getCharacterLimitMessages(messages: MessageContentI[], limit: number) {
    if (limit === -1) return messages;
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

  private static getMaxMessages(messages: MessageContentI[], maxMessages: number) {
    return messages.slice(Math.max(messages.length - maxMessages, 0));
  }

  // prettier-ignore
  // if maxMessages is not defined we send all messages
  // if maxMessages above 0 we send that number
  // if maxMessages 0 or below we send only what is in the request
  public static processMessages(messages: MessageContentI[], maxMessages?: number, totalMessagesMaxCharLength?: number) {
    if (maxMessages !== undefined) {
      if (maxMessages > 0) messages = MessageLimitUtils.getMaxMessages(messages, maxMessages);
    } else {
      messages = [messages[messages.length - 1]]; // last message
    }
    messages = JSON.parse(JSON.stringify(messages));
    if (totalMessagesMaxCharLength === undefined) return messages;
    return MessageLimitUtils.getCharacterLimitMessages(messages, totalMessagesMaxCharLength);
  }
}
