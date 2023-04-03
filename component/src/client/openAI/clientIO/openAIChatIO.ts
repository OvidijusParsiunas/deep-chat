import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {OpenAIChat, OpenAIMessage} from '../../../types/openAI';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIClientIO} from './openAIClientIO';

// chat is a form of completions
export class OpenAIChatIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/chat/completions';

  buildBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(baseBody)) as OpenAIChat & OpenAIInternalBody;
    if (body.initMessages) {
      const chatMessages: OpenAIMessage[] = messagesObj.messages.map((message) => {
        return {content: message.text, role: message.role === 'ai' ? 'assistant' : message.role};
      });
      const allMessages = body.initMessages.concat(...chatMessages);
      delete body.initMessages;
      body.messages = allMessages;
    }
    return body;
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
