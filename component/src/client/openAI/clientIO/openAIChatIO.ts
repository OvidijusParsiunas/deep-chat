import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIChatBody} from '../../../types/openAIBodies';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIClientIO} from './openAIClientIO';

// chat is a form of completions
export class OpenAIChatIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/chat/completions';

  buildBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const body = JSON.parse(JSON.stringify(baseBody)) as OpenAIChatBody & OpenAIInternalBody;
    if (body.systemMessage) {
      body.messages = [body.systemMessage, ...messagesObj.messages];
      delete body.systemMessage;
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
