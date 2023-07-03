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

// exercise caution when defining default returns for directConnection as their configs can be undefined
export class ServiceIOFactory {
  public static create(deepChat: DeepChat): ServiceIO {
    const {directConnection} = deepChat;
    if (directConnection) {
      if (directConnection.openAI) {
        if (directConnection.openAI.images) {
          return new OpenAIImagesIO(deepChat);
        }
        if (directConnection.openAI.audio) {
          return new OpenAIAudioIO(deepChat);
        }
        if (directConnection.openAI.completions) {
          return new OpenAICompletionsIO(deepChat);
        }
        return new OpenAIChatIO(deepChat);
      }
      if (directConnection.assemblyAI) {
        return new AssemblyAIAudioIO(deepChat);
      }
      if (directConnection.cohere) {
        if (directConnection.cohere.summarization) {
          return new CohereSummarizationIO(deepChat);
        }
        return new CohereTextGenerationIO(deepChat);
      }
      if (directConnection.huggingFace) {
        if (directConnection.huggingFace.textGeneration) {
          return new HuggingFaceTextGenerationIO(deepChat);
        }
        if (directConnection.huggingFace.summarization) {
          return new HuggingFaceSummarizationIO(deepChat);
        }
        if (directConnection.huggingFace.translation) {
          return new HuggingFaceTranslationIO(deepChat);
        }
        if (directConnection.huggingFace.fillMask) {
          return new HuggingFaceFillMaskIO(deepChat);
        }
        if (directConnection.huggingFace.questionAnswer) {
          return new HuggingFaceQuestionAnswerIO(deepChat);
        }
        if (directConnection.huggingFace.audioSpeechRecognition) {
          return new HuggingFaceAudioRecognitionIO(deepChat);
        }
        if (directConnection.huggingFace.audioClassification) {
          return new HuggingFaceAudioClassificationIO(deepChat);
        }
        if (directConnection.huggingFace.imageClassification) {
          return new HuggingFaceImageClassificationIO(deepChat);
        }
        return new HuggingFaceConversationIO(deepChat);
      }
      if (directConnection.azure) {
        if (directConnection.azure?.speechToText) {
          return new AzureSpeechToTextIO(deepChat);
        }
        if (directConnection.azure?.textToSpeech) {
          return new AzureTextToSpeechIO(deepChat);
        }
        if (directConnection.azure?.summarization) {
          return new AzureSummarizationIO(deepChat);
        }
        if (directConnection.azure?.translation) {
          return new AzureTranslationIO(deepChat);
        }
      }
      if (directConnection.demo) {
        return new BaseServiceIO(deepChat, undefined, directConnection.demo);
      }
    }
    return new BaseServiceIO(deepChat);
  }
}
