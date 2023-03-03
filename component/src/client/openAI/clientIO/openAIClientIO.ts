import {OpenAIInternalParams} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';

export interface OpenAIClientIO {
  url: string;

  buildBody(params: OpenAIInternalParams, messages: Messages): string;

  extractTextFromResult(result: OpenAIResult): string;
}
