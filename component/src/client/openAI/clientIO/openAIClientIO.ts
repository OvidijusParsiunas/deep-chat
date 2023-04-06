import {OpenAIChatBody, OpenAICompletionsBody} from '../../../types/openAIBodies';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';

export interface OpenAIClientIO {
  url: string;

  buildBody(baseBody: OpenAIInternalBody, messages: Messages): OpenAIChatBody | OpenAICompletionsBody;

  extractTextFromResult(result: OpenAIResult): string;
}
