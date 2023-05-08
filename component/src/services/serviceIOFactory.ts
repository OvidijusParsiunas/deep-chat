import {HuggingFaceTextGenerationIO} from './huggingFace/huggingFaceTextGenerationIO';
import {HuggingFaceSummarizeIO} from './huggingFace/huggingFaceSummarizeIO';
import {OpenAICompletionsIO} from './openAI/openAICompletionsIO';
import {AssemblyAIAudioIO} from './assemblyAI/assemblyAIAudioIO';
import {CustomServiceIO} from './customService/customServiceIO';
import {OpenAIImagesIO} from './openAI/openAIImagesIO';
import {OpenAIAudioIO} from './openAI/openAIAudioIO';
import {CohereTextIO} from './cohere/cohereTextIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {AiAssistant} from '../aiAssistant';
import {ServiceIO} from './serviceIO';

export class ServiceIOFactory {
  public static create(aiAssistant: AiAssistant, key?: string): ServiceIO {
    if (aiAssistant.customService) {
      return new CustomServiceIO(aiAssistant);
    }
    if (aiAssistant.openAI?.images) {
      return new OpenAIImagesIO(aiAssistant, key);
    }
    if (aiAssistant.openAI?.audio) {
      return new OpenAIAudioIO(aiAssistant, key);
    }
    if (aiAssistant.openAI?.completions) {
      return new OpenAICompletionsIO(aiAssistant, key);
    }
    if (aiAssistant.assemblyAI?.audio) {
      return new AssemblyAIAudioIO(aiAssistant, key);
    }
    if (aiAssistant.cohere?.textGeneration || aiAssistant.cohere?.summarize) {
      return new CohereTextIO(aiAssistant, key);
    }
    if (aiAssistant.huggingFace?.textGeneration) {
      return new HuggingFaceTextGenerationIO(aiAssistant, key);
    }
    if (aiAssistant.huggingFace?.summarize) {
      return new HuggingFaceSummarizeIO(aiAssistant, key);
    }
    return new OpenAIChatIO(aiAssistant, key);
  }
}
