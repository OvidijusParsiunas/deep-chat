import {OpenAIBaseBodyGenerator} from '../body/openAIBaseBodyGenerator';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';
import {OpenAIClientIO} from './openAIClientIO';

export class OpenAICompletionIO implements OpenAIClientIO {
  url = 'https://api.openai.com/v1/completions';
  private readonly _maxCharLength: number = OpenAIBaseBodyGenerator.MAX_CHAR_LENGTH;
  // text-davinci-003 total max limit is 4097 - keeping it at 4000 just to be safe
  private readonly full_transaction_max_tokens = 4000;
  // it is recommended to consider that just under 4 chars are in a token - https://platform.openai.com/tokenizer
  private readonly numberOfCharsPerToken = 3.5;

  constructor(baseBody: OpenAIInternalBody, inputCharacterLimit?: number) {
    const newMaxCharLength = baseBody.max_char_length || inputCharacterLimit;
    if (newMaxCharLength) this._maxCharLength = newMaxCharLength;
    this.cleanBody(baseBody);
  }

  private cleanBody(body: OpenAIInternalBody) {
    delete body.max_char_length;
  }

  // prettier-ignore
  preprocessBody(baseBody: OpenAIInternalBody, messagesObj: Messages) {
    const mostRecentMessageText = messagesObj.messages[messagesObj.messages.length - 1].content;
    const processedMessage = mostRecentMessageText.substring(0, this._maxCharLength);
    // Completions with no max_tokens behave weirdly and do not give full responses
    // Client should specify their own max_tokens.
    const maxTokens = baseBody.max_tokens
      || this.full_transaction_max_tokens - processedMessage.length / this.numberOfCharsPerToken;
    const maxTokensInt = Math.floor(maxTokens);
    return {prompt: processedMessage, max_tokens: maxTokensInt, ...baseBody};
  }

  extractTextFromResult(result: OpenAIResult): string {
    if (result.error) throw result.error.message;
    return result.choices[0]?.text || '';
  }
}
