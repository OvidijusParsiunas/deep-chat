import {OpenAIBaseBodyGenerator} from '../body/openAIBaseBodyGenerator';
import {OpenAIInternalBody} from '../../../types/openAIInternal';
import {OpenAICompletionIO} from './openAICompletionIO';
import {OpenAIClientIO} from './openAIClientIO';
import {OpenAIChatIO} from './openAIChatIO';

export class OpenAIClientIOFactory {
  public static getClientIO(baseBody: OpenAIInternalBody, inputCharacterLimit?: number): OpenAIClientIO {
    if (baseBody.model?.startsWith(OpenAIBaseBodyGenerator.GPT_CHAT_TURBO_MODEL)) {
      return new OpenAIChatIO();
    }
    return new OpenAICompletionIO(baseBody, inputCharacterLimit);
  }
}
