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
import {ServiceIO} from './serviceIO';
import {DeepChat} from '../deepChat';

// exercise caution when defining default returns for existingService as their configs can be undefined
export class ServiceIOFactory {
  public static create(deepChat: DeepChat): ServiceIO {
    const {existingService} = deepChat;
    if (existingService) {
      if (existingService.openAI) {
        if (existingService.openAI.images) {
          return new OpenAIImagesIO(deepChat);
        }
        if (existingService.openAI.audio) {
          return new OpenAIAudioIO(deepChat);
        }
        if (existingService.openAI.completions) {
          return new OpenAICompletionsIO(deepChat);
        }
        return new OpenAIChatIO(deepChat);
      }
      if (existingService.assemblyAI) {
        return new AssemblyAIAudioIO(deepChat);
      }
      if (existingService.cohere) {
        if (existingService.cohere.summarization) {
          return new CohereSummarizationIO(deepChat);
        }
        return new CohereTextGenerationIO(deepChat);
      }
      if (existingService.huggingFace) {
        if (existingService.huggingFace.textGeneration) {
          return new HuggingFaceTextGenerationIO(deepChat);
        }
        if (existingService.huggingFace.summarization) {
          return new HuggingFaceSummarizationIO(deepChat);
        }
        if (existingService.huggingFace.translation) {
          return new HuggingFaceTranslationIO(deepChat);
        }
        if (existingService.huggingFace.fillMask) {
          return new HuggingFaceFillMaskIO(deepChat);
        }
        if (existingService.huggingFace.questionAnswer) {
          return new HuggingFaceQuestionAnswerIO(deepChat);
        }
        if (existingService.huggingFace.audioSpeechRecognition) {
          return new HuggingFaceAudioRecognitionIO(deepChat);
        }
        if (existingService.huggingFace.audioClassification) {
          return new HuggingFaceAudioClassificationIO(deepChat);
        }
        if (existingService.huggingFace.imageClassification) {
          return new HuggingFaceImageClassificationIO(deepChat);
        }
        return new HuggingFaceConversationIO(deepChat);
      }
      if (existingService.azure) {
        if (existingService.azure?.speechToText) {
          return new AzureSpeechToTextIO(deepChat);
        }
        if (existingService.azure?.textToSpeech) {
          return new AzureTextToSpeechIO(deepChat);
        }
        if (existingService.azure?.summarization) {
          return new AzureSummarizationIO(deepChat);
        }
        if (existingService.azure?.translation) {
          return new AzureTranslationIO(deepChat);
        }
      }
      if (existingService.demo) {
        return new BaseServiceIO(deepChat, undefined, existingService.demo);
      }
    }
    return new BaseServiceIO(deepChat);
  }
}
