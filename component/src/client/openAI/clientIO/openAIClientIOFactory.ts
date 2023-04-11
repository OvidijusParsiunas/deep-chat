import {OpenAIBaseBodyGenerator} from '../body/openAIBaseBodyGenerator';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {OpenAICompletionIO} from './openAICompletionIO';
import {OpenAIClientIO} from './openAIClientIO';
import {OpenAIChatIO} from './openAIChatIO';

export class OpenAIClientIOFactory {
  public static getClientIO(baseBody: OpenAIInternalBody): OpenAIClientIO {
    if (baseBody.model?.startsWith(OpenAIBaseBodyGenerator.GPT_CHAT_TURBO_MODEL)) {
      return new OpenAIChatIO(baseBody.total_messages_max_char_length);
    }
    return new OpenAICompletionIO(baseBody.max_char_length);
  }
}
