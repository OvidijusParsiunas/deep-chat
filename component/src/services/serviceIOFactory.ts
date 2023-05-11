import {HuggingFaceAudioClassificationIO} from './huggingFace/huggingFaceAudioClassificationIO';
import {HuggingFaceImageClassificationIO} from './huggingFace/huggingFaceImageClassificationIO';
import {HuggingFaceAudioRecognitionIO} from './huggingFace/huggingFaceAudioRecognitionIO';
import {HuggingFaceTextGenerationIO} from './huggingFace/huggingFaceTextGenerationIO';
import {HuggingFaceQuestionAnswerIO} from './huggingFace/huggingFaceQuestionAnswerIO';
import {HuggingFaceConversationIO} from './huggingFace/huggingFaceConversationIO';
import {HuggingFaceTranslationIO} from './huggingFace/huggingFaceTranslationIO';
import {HuggingFaceSummarizeIO} from './huggingFace/huggingFaceSummarizeIO';
import {HuggingFaceFillMaskIO} from './huggingFace/huggingFaceFillMaskIO';
import {CohereTextGenerationIO} from './cohere/cohereTextGenerationIO';
import {OpenAICompletionsIO} from './openAI/openAICompletionsIO';
import {AssemblyAIAudioIO} from './assemblyAI/assemblyAIAudioIO';
import {CustomServiceIO} from './customService/customServiceIO';
import {AzureTextToSpeechIO} from './azure/azureTextToSpeechIO';
import {AzureSpeechToTextIO} from './azure/azureSpeechToTextIO';
import {CohereSummarizeIO} from './cohere/cohereSummarizeIO';
import {OpenAIImagesIO} from './openAI/openAIImagesIO';
import {OpenAIAudioIO} from './openAI/openAIAudioIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {AiAssistant} from '../aiAssistant';
import {ServiceIO} from './serviceIO';

// exercise caution when defining default returns for services as their configs can be undefined
export class ServiceIOFactory {
  public static create(aiAssistant: AiAssistant, key?: string): ServiceIO {
    const {service: services} = aiAssistant;
    if (services) {
      if (services.custom) {
        return new CustomServiceIO(aiAssistant);
      }
      if (services.openAI) {
        if (services.openAI.images) {
          return new OpenAIImagesIO(aiAssistant, key);
        }
        if (services.openAI.audio) {
          return new OpenAIAudioIO(aiAssistant, key);
        }
        if (services.openAI.completions) {
          return new OpenAICompletionsIO(aiAssistant, key);
        }
        return new OpenAIChatIO(aiAssistant, key);
      }
      if (services.assemblyAI) {
        return new AssemblyAIAudioIO(aiAssistant, key);
      }
      if (services.cohere) {
        if (services.cohere.summarize) {
          return new CohereSummarizeIO(aiAssistant, key);
        }
        return new CohereTextGenerationIO(aiAssistant, key);
      }
      if (services.huggingFace) {
        if (services.huggingFace.textGeneration) {
          return new HuggingFaceTextGenerationIO(aiAssistant, key);
        }
        if (services.huggingFace.summarize) {
          return new HuggingFaceSummarizeIO(aiAssistant, key);
        }
        if (services.huggingFace.translation) {
          return new HuggingFaceTranslationIO(aiAssistant, key);
        }
        if (services.huggingFace.fillMask) {
          return new HuggingFaceFillMaskIO(aiAssistant, key);
        }
        if (services.huggingFace.questionAnswer) {
          return new HuggingFaceQuestionAnswerIO(aiAssistant, key);
        }
        if (services.huggingFace.audioSpeechRecognition) {
          return new HuggingFaceAudioRecognitionIO(aiAssistant, key);
        }
        if (services.huggingFace.audioClassification) {
          return new HuggingFaceAudioClassificationIO(aiAssistant, key);
        }
        if (services.huggingFace.imageClassification) {
          return new HuggingFaceImageClassificationIO(aiAssistant, key);
        }
        return new HuggingFaceConversationIO(aiAssistant, key);
      }
      if (services.azure) {
        if (services.azure?.speechToText) {
          return new AzureSpeechToTextIO(aiAssistant, key);
        }
        if (services.azure?.textToSpeech) {
          return new AzureTextToSpeechIO(aiAssistant, key);
        }
      }
    }
    throw new Error("Please define a service in the 'service' property"); // TO-DO - default to service selection view
  }
}
