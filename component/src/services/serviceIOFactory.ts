import {OpenAICompletionsIO} from './openAI/openAICompletionsIO';
import {CustomServiceIO} from './customService/customServiceIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {AiAssistant} from '../aiAssistant';
import {ServiceIO} from './serviceIO';

export class ServiceIOFactory {
  public static create(aiAssistant: AiAssistant, key?: string): ServiceIO {
    if (aiAssistant.customService) {
      return new CustomServiceIO(aiAssistant);
    }
    if (aiAssistant.openAI?.completions) {
      return new OpenAICompletionsIO(aiAssistant, key);
    }
    return new OpenAIChatIO(aiAssistant, key);
  }
}
