import {OpenAIInternalParams} from '../../../types/openAIInternal';
import {OpenAICompletionIO} from './openAICompletionIO';
import {OpenAIClientIO} from './openAIClientIO';
import {OpenAIChatIO} from './openAIChatIO';

export class OpenAIClientIOFactory {
  public static getClientIO(params: OpenAIInternalParams): OpenAIClientIO {
    if (params.model.startsWith('gpt-3.5-turbo')) {
      return new OpenAIChatIO();
    }
    return new OpenAICompletionIO();
  }
}
