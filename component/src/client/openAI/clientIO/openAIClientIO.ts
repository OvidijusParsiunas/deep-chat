import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {RequestBody} from '../../../types/requestInterceptor';
import {OpenAIResult} from '../../../types/openAIResult';

export interface OpenAIClientIO {
  url: string;

  preprocessBody(baseBody: OpenAIInternalBody, messages: Messages): RequestBody;

  extractTextFromResult(result: OpenAIResult): string;
}
