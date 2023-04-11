import {OpenAIBaseBodyGenerator} from '../body/openAIBaseBodyGenerator';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {MessageContent} from '../../../types/messages';
import {OpenAIClientIO} from './openAIClientIO';

// chat is a form of completions
export class OpenAIChatIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/chat/completions';
  private readonly _totalMessagesMaxCharLength: number = OpenAIBaseBodyGenerator.MAX_CHAR_LENGTH;
  private readonly _maxMessages?: number;

  constructor(totalMessagesMaxCharLength?: number, maxMessages?: number) {
    if (totalMessagesMaxCharLength) this._totalMessagesMaxCharLength = totalMessagesMaxCharLength;
    this._maxMessages = maxMessages;
  }

  preprocessBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(baseBody)) as OpenAIInternalBody;
    const messages = JSON.parse(JSON.stringify(messagesObj.messages)) as MessageContent[];
    if (body.systemMessage) {
      const processedMessages = this.processMessages(messages, body.systemMessage.content.length);
      body.messages = [body.systemMessage, ...processedMessages];
      delete body.systemMessage;
    }
    return body;
  }

  private processMessages(messages: MessageContent[], systemMessageLength: number) {
    let totalCharacters = 0;
    if (this._maxMessages !== undefined && this._maxMessages > 0) {
      messages = messages.splice(Math.max(messages.length - this._maxMessages, 0));
    }
    // Not removing the first message in order to retain the initial 'system' message
    const limit = this._totalMessagesMaxCharLength - systemMessageLength;
    let i = messages.length - 1;
    for (i; i >= 0; i -= 1) {
      totalCharacters += messages[i].content.length;
      if (totalCharacters > limit) {
        messages[i].content = messages[i].content.substring(0, messages[i].content.length - (totalCharacters - limit));
        break;
      }
    }
    return messages.slice(i);
  }

  extractTextFromResult(result: OpenAIResult): string {
    if (result.error) throw result.error.message;
    if (result.choices[0].delta) {
      return result.choices[0].delta.content || '';
    }
    if (result.choices[0].message) {
      return result.choices[0].message.content;
    }
    return '';
  }
}
