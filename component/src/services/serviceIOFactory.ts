import {HuggingFaceAudioClassificationIO} from './huggingFace/huggingFaceAudioClassificationIO';
import {HuggingFaceImageClassificationIO} from './huggingFace/huggingFaceImageClassificationIO';
import {HuggingFaceAudioRecognitionIO} from './huggingFace/huggingFaceAudioRecognitionIO';
import {HuggingFaceTextGenerationIO} from './huggingFace/huggingFaceTextGenerationIO';
import {HuggingFaceQuestionAnswerIO} from './huggingFace/huggingFaceQuestionAnswerIO';
import {HuggingFaceSummarizationIO} from './huggingFace/huggingFaceSummarizationIO';
import {HuggingFaceConversationIO} from './huggingFace/huggingFaceConversationIO';
import {HuggingFaceTranslationIO} from './huggingFace/huggingFaceTranslationIO';
import {HuggingFaceFillMaskIO} from './huggingFace/huggingFaceFillMaskIO';
import {CohereTextGenerationIO} from './cohere/cohereTextGenerationIO';
import {CohereSummarizationIO} from './cohere/cohereSummarizationIO';
import {AzureSummarizationIO} from './azure/azureSummarizationIO';
import {OpenAICompletionsIO} from './openAI/openAICompletionsIO';
import {AssemblyAIAudioIO} from './assemblyAI/assemblyAIAudioIO';
import {AzureTextToSpeechIO} from './azure/azureTextToSpeechIO';
import {AzureSpeechToTextIO} from './azure/azureSpeechToTextIO';
import {AzureTranslationIO} from './azure/azureTranslationIO';
import {OpenAIImagesIO} from './openAI/openAIImagesIO';
import {OpenAIAudioIO} from './openAI/openAIAudioIO';
import {BaseServiceIO} from './utils/baseServiceIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {AiAssistant} from '../aiAssistant';
import {ServiceIO} from './serviceIO';

// exercise caution when defining default returns for existingService as their configs can be undefined
export class ServiceIOFactory {
  public static create(aiAssistant: AiAssistant): ServiceIO {
    const {existingService} = aiAssistant;
    if (existingService) {
      if (existingService.openAI) {
        if (existingService.openAI.images) {
          return new OpenAIImagesIO(aiAssistant);
        }
        if (existingService.openAI.audio) {
          return new OpenAIAudioIO(aiAssistant);
        }
        if (existingService.openAI.completions) {
          return new OpenAICompletionsIO(aiAssistant);
        }
        return new OpenAIChatIO(aiAssistant);
      }
      if (existingService.assemblyAI) {
        return new AssemblyAIAudioIO(aiAssistant);
      }
      if (existingService.cohere) {
        if (existingService.cohere.summarization) {
          return new CohereSummarizationIO(aiAssistant);
        }
        return new CohereTextGenerationIO(aiAssistant);
      }
      if (existingService.huggingFace) {
        if (existingService.huggingFace.textGeneration) {
          return new HuggingFaceTextGenerationIO(aiAssistant);
        }
        if (existingService.huggingFace.summarization) {
          return new HuggingFaceSummarizationIO(aiAssistant);
        }
        if (existingService.huggingFace.translation) {
          return new HuggingFaceTranslationIO(aiAssistant);
        }
        if (existingService.huggingFace.fillMask) {
          return new HuggingFaceFillMaskIO(aiAssistant);
        }
        if (existingService.huggingFace.questionAnswer) {
          return new HuggingFaceQuestionAnswerIO(aiAssistant);
        }
        if (existingService.huggingFace.audioSpeechRecognition) {
          return new HuggingFaceAudioRecognitionIO(aiAssistant);
        }
        if (existingService.huggingFace.audioClassification) {
          return new HuggingFaceAudioClassificationIO(aiAssistant);
        }
        if (existingService.huggingFace.imageClassification) {
          return new HuggingFaceImageClassificationIO(aiAssistant);
        }
        return new HuggingFaceConversationIO(aiAssistant);
      }
      if (existingService.azure) {
        if (existingService.azure?.speechToText) {
          return new AzureSpeechToTextIO(aiAssistant);
        }
        if (existingService.azure?.textToSpeech) {
          return new AzureTextToSpeechIO(aiAssistant);
        }
        if (existingService.azure?.summarization) {
          return new AzureSummarizationIO(aiAssistant);
        }
        if (existingService.azure?.translation) {
          return new AzureTranslationIO(aiAssistant);
        }
      }
      if (existingService.demo) {
        return new BaseServiceIO(aiAssistant, undefined, existingService.demo);
      }
    }
    return new BaseServiceIO(aiAssistant);
  }
}
