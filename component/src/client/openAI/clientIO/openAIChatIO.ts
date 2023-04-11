import {OpenAIBaseBodyGenerator} from '../body/openAIBaseBodyGenerator';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {MessageContent} from '../../../types/messages';
import {OpenAIClientIO} from './openAIClientIO';

// chat is a form of completions
export class OpenAIChatIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/chat/completions';

  // prettier-ignore
  preprocessBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(baseBody)) as OpenAIInternalBody;
    const messages = JSON.parse(JSON.stringify(messagesObj.messages)) as MessageContent[];
    if (body.systemMessage) {
      const totalMessagesMaxCharLength = body.total_messages_max_char_length || OpenAIBaseBodyGenerator.MAX_CHAR_LENGTH;
      const processedMessages = this.processMessages(messages, body.systemMessage.content.length,
        totalMessagesMaxCharLength, baseBody.max_messages);
      body.messages = [body.systemMessage, ...processedMessages];
      this.cleanBody(body);
    }
    return body;
  }

  // prettier-ignore
  private processMessages(messages: MessageContent[], systemMessageLength: number, totalMessagesMaxCharLength: number,
      maxMessages?: number) {
    let totalCharacters = 0;
    if (maxMessages !== undefined && maxMessages > 0) {
      messages = messages.splice(Math.max(messages.length - maxMessages, 0));
    }
    // Not removing the first message in order to retain the initial 'system' message
    const limit = totalMessagesMaxCharLength - systemMessageLength;
    let i = messages.length - 1;
    for (i; i >= 0; i -= 1) {
      totalCharacters += messages[i].content.length;
      if (totalCharacters > limit) {
        messages[i].content = messages[i].content.substring(0, messages[i].content.length - (totalCharacters - limit));
        break;
      }
    }
    return messages.slice(Math.max(i, 0));
  }

  private cleanBody(body: OpenAIInternalBody) {
    delete body.systemMessage;
    delete body.total_messages_max_char_length;
    delete body.max_messages;
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
