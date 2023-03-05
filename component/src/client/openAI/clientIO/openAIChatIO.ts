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
    if (body.startMessages) {
      const chatMessages: OpenAIMessage[] = messagesObj.messages.map((message) => {
        return {content: message.text, role: message.role === 'ai' ? 'assistant' : message.role};
      });
      const allMessages = body.startMessages.concat(...chatMessages);
      delete body.startMessages;
      body.messages = allMessages;
    }
    return JSON.stringify(body);
  }

  extractTextFromResult(result: OpenAIResult): string {
    if (result.choices[0].delta) {
      return result.choices[0].delta.content || '';
    }
    if (result.choices[0].message) {
      return result.choices[0].message.content;
    }
    return '';
  }
}
