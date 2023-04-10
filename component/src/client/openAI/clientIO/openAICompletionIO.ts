import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIClientIO} from './openAIClientIO';

export class OpenAICompletionIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/completions';

  preprocessBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const mostRecentMessageText = messagesObj.messages[messagesObj.messages.length - 1].content;
    return {prompt: mostRecentMessageText, ...baseBody};
  }

  extractTextFromResult(result: OpenAIResult): string {
    if (result.error) throw result.error.message;
    return result.choices[0]?.text || '';
  }
}
