import {OpenAIChat, OpenAICompletions} from '../../../types/openAI';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {Messages} from '../../../views/chat/messages/messages';
import {OpenAIResult} from '../../../types/openAIResult';

export interface OpenAIClientIO {
  url: string;

  buildBody(baseBody: OpenAIInternalBody, messages: Messages): OpenAIChat | OpenAICompletions;

  extractTextFromResult(result: OpenAIResult): string;
}
