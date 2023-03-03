import {OpenAIInternalParams} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIClientIO} from './openAIClientIO';

export class OpenAICompletionIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/completions';

  buildBody(params: OpenAIInternalParams, messagesObj: Messages) {
    const mostRecentMessageText = messagesObj.messages[messagesObj.messages.length - 1].text;
    return JSON.stringify({prompt: mostRecentMessageText, ...params});
  }

  extractTextFromResult(result: OpenAIResult): string {
    return result.choices[0].text;
  }
}
