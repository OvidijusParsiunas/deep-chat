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

// exercise caution when defining default returns for services as their configs can be undefined
export class ServiceIOFactory {
  public static create(aiAssistant: AiAssistant): ServiceIO {
    const {service: services} = aiAssistant;
    if (services) {
      if (services.openAI) {
        if (services.openAI.images) {
          return new OpenAIImagesIO(aiAssistant);
        }
        if (services.openAI.audio) {
          return new OpenAIAudioIO(aiAssistant);
        }
        if (services.openAI.completions) {
          return new OpenAICompletionsIO(aiAssistant);
        }
        return new OpenAIChatIO(aiAssistant);
      }
      if (services.assemblyAI) {
        return new AssemblyAIAudioIO(aiAssistant);
      }
      if (services.cohere) {
        if (services.cohere.summarization) {
          return new CohereSummarizationIO(aiAssistant);
        }
        return new CohereTextGenerationIO(aiAssistant);
      }
      if (services.huggingFace) {
        if (services.huggingFace.textGeneration) {
          return new HuggingFaceTextGenerationIO(aiAssistant);
        }
        if (services.huggingFace.summarization) {
          return new HuggingFaceSummarizationIO(aiAssistant);
        }
        if (services.huggingFace.translation) {
          return new HuggingFaceTranslationIO(aiAssistant);
        }
        if (services.huggingFace.fillMask) {
          return new HuggingFaceFillMaskIO(aiAssistant);
        }
        if (services.huggingFace.questionAnswer) {
          return new HuggingFaceQuestionAnswerIO(aiAssistant);
        }
        if (services.huggingFace.audioSpeechRecognition) {
          return new HuggingFaceAudioRecognitionIO(aiAssistant);
        }
        if (services.huggingFace.audioClassification) {
          return new HuggingFaceAudioClassificationIO(aiAssistant);
        }
        if (services.huggingFace.imageClassification) {
          return new HuggingFaceImageClassificationIO(aiAssistant);
        }
        return new HuggingFaceConversationIO(aiAssistant);
      }
      if (services.azure) {
        if (services.azure?.speechToText) {
          return new AzureSpeechToTextIO(aiAssistant);
        }
        if (services.azure?.textToSpeech) {
          return new AzureTextToSpeechIO(aiAssistant);
        }
        if (services.azure?.summarization) {
          return new AzureSummarizationIO(aiAssistant);
        }
        if (services.azure?.translation) {
          return new AzureTranslationIO(aiAssistant);
        }
      }
      if (services.demo) {
        return new BaseServiceIO(aiAssistant, undefined, services.demo);
      }
    }
    return new BaseServiceIO(aiAssistant);
  }
}
