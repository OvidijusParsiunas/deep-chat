import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';

export interface OpenAIClientIO {
  url: string;

  buildBody(params: OpenAIInternalBody, messages: Messages): string;

  extractTextFromResult(result: OpenAIResult): string;
}
