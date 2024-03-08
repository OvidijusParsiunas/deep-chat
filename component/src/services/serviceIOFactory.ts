import {HuggingFaceAudioClassificationIO} from './huggingFace/huggingFaceAudioClassificationIO';
import {HuggingFaceImageClassificationIO} from './huggingFace/huggingFaceImageClassificationIO';
import {StabilityAIImageToImageUpscaleIO} from './stabilityAI/stabilityAIImageToImageUpscaleIO';
import {StabilityAIImageToImageMaskingIO} from './stabilityAI/stabilityAIImageToImageMaskingIO';
import {HuggingFaceAudioRecognitionIO} from './huggingFace/huggingFaceAudioRecognitionIO';
import {HuggingFaceTextGenerationIO} from './huggingFace/huggingFaceTextGenerationIO';
import {HuggingFaceQuestionAnswerIO} from './huggingFace/huggingFaceQuestionAnswerIO';
import {HuggingFaceSummarizationIO} from './huggingFace/huggingFaceSummarizationIO';
import {HuggingFaceConversationIO} from './huggingFace/huggingFaceConversationIO';
import {StabilityAIImageToImageIO} from './stabilityAI/stabilityAIImageToImageIO';
import {HuggingFaceTranslationIO} from './huggingFace/huggingFaceTranslationIO';
import {StabilityAITextToImageIO} from './stabilityAI/stabilityAITextToImageIO';
import {HuggingFaceFillMaskIO} from './huggingFace/huggingFaceFillMaskIO';
import {CohereTextGenerationIO} from './cohere/cohereTextGenerationIO';
import {CohereSummarizationIO} from './cohere/cohereSummarizationIO';
import {OpenAITextToSpeechIO} from './openAI/openAITextToSpeechIO';
import {OpenAISpeechToTextIO} from './openAI/openAISpeechToTextIO';
import {AzureSummarizationIO} from './azure/azureSummarizationIO';
import {AssemblyAIAudioIO} from './assemblyAI/assemblyAIAudioIO';
import {AzureTextToSpeechIO} from './azure/azureTextToSpeechIO';
import {AzureSpeechToTextIO} from './azure/azureSpeechToTextIO';
import {AzureTranslationIO} from './azure/azureTranslationIO';
import {OpenAIAssistantIO} from './openAI/openAIAssistantIO';
import {OpenAIImagesIO} from './openAI/openAIImagesIO';
import {BaseServiceIO} from './utils/baseServiceIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {CohereChatIO} from './cohere/cohereChatIO';
import {WebModel} from '../webModel/webModel';
import {MistralIO} from './mistral/mistralO';
import {ServiceIO} from './serviceIO';
import {DeepChat} from '../deepChat';

// exercise caution when defining default returns for directConnection as their configs can be undefined
export class ServiceIOFactory {
  // this should only be called when no _activeService is set or is demo as otherwise we don't want to reconnect
  public static create(deepChat: DeepChat): ServiceIO {
    const {directConnection, connect, demo, webModel} = deepChat;
    if (webModel) {
      return new WebModel(deepChat);
    }
    if (directConnection) {
      if (directConnection.openAI) {
        if (directConnection.openAI.images) {
          return new OpenAIImagesIO(deepChat);
        }
        if (directConnection.openAI.speechToText) {
          return new OpenAISpeechToTextIO(deepChat);
        }
        if (directConnection.openAI.textToSpeech) {
          return new OpenAITextToSpeechIO(deepChat);
        }
        if (directConnection.openAI.assistant) {
          return new OpenAIAssistantIO(deepChat);
        }
        return new OpenAIChatIO(deepChat);
      }
      if (directConnection.assemblyAI) {
        return new AssemblyAIAudioIO(deepChat);
      }
      if (directConnection.cohere) {
        if (directConnection.cohere.textGeneration) {
          return new CohereTextGenerationIO(deepChat);
        }
        if (directConnection.cohere.summarization) {
          return new CohereSummarizationIO(deepChat);
        }
        return new CohereChatIO(deepChat);
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
        if (directConnection.azure.speechToText) {
          return new AzureSpeechToTextIO(deepChat);
        }
        if (directConnection.azure.textToSpeech) {
          return new AzureTextToSpeechIO(deepChat);
        }
        if (directConnection.azure.summarization) {
          return new AzureSummarizationIO(deepChat);
        }
        if (directConnection.azure.translation) {
          return new AzureTranslationIO(deepChat);
        }
      }
      if (directConnection.stabilityAI) {
        if (directConnection.stabilityAI.imageToImage) {
          return new StabilityAIImageToImageIO(deepChat);
        }
        if (directConnection.stabilityAI.imageToImageUpscale) {
          return new StabilityAIImageToImageUpscaleIO(deepChat);
        }
        if (directConnection.stabilityAI.imageToImageMasking) {
          return new StabilityAIImageToImageMaskingIO(deepChat);
        }
        return new StabilityAITextToImageIO(deepChat);
      }
      if (directConnection.mistral) {
        return new MistralIO(deepChat);
      }
    }
    // if connect, make sure it is not a demo stream
    if (connect && (!demo || !connect.stream)) {
      return new BaseServiceIO(deepChat);
    }
    // when not directConnection and connect connection, we default to demo
    return new BaseServiceIO(deepChat, undefined, demo || true);
  }
}
