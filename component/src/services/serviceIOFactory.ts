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
import {BigModelTextToSpeechIO} from './bigModel/bigModelTextToSpeechIO';
import {TogetherTextToSpeechIO} from './together/togetherTextToSpeechIO';
import {OpenAIAssistantIO} from './openAI/assistant/openAIAssistantIO';
import {AzureOpenAIAssistantIO} from './azure/azureOpenAIAssistantIO';
import {OpenAIRealtimeIO} from './openAI/realtime/openAIRealtimeIO';
import {OpenAITextToSpeechIO} from './openAI/openAITextToSpeechIO';
import {OpenAISpeechToTextIO} from './openAI/openAISpeechToTextIO';
import {AzureSummarizationIO} from './azure/azureSummarizationIO';
import {AssemblyAIAudioIO} from './assemblyAI/assemblyAIAudioIO';
import {AzureTextToSpeechIO} from './azure/azureTextToSpeechIO';
import {AzureSpeechToTextIO} from './azure/azureSpeechToTextIO';
import {AzureTranslationIO} from './azure/azureTranslationIO';
import {BigModelImagesIO} from './bigModel/bigModelImagesIO';
import {GroqTextToSpeechIO} from './groq/groqTextToSpeechIO';
import {TogetherImagesIO} from './together/togetherImagesIO';
import {AzureOpenAIChatIO} from './azure/azureOpenAIChatIO';
import {BigModelChatIO} from './bigModel/bigModelChatIO';
import {TogetherChatIO} from './together/togetherChatIO';
import {OpenAIImagesIO} from './openAI/openAIImagesIO';
import {OpenRouterIO} from './openRouter/openRouterIO';
import {PerplexityIO} from './perplexity/perplexityIO';
import {BaseServiceIO} from './utils/baseServiceIO';
import {OpenAIChatIO} from './openAI/openAIChatIO';
import {CohereChatIO} from './cohere/cohereChatIO';
import {DeepSeekIO} from './deepSeek/deepSeekIO';
import {MiniMaxIO} from './miniMax/miniMaxIO';
import {WebModel} from '../webModel/webModel';
import {MistralIO} from './mistral/mistralO';
import {GroqChatIO} from './groq/groqChatIO';
import {GeminiIO} from './gemini/geminiIO';
import {ClaudeIO} from './claude/claudeIO';
import {OllamaIO} from './ollama/ollamaIO';
import {XImagesIO} from './x/xImagesIO';
import {ServiceIO} from './serviceIO';
import {QwenIO} from './qwen/qwenIO';
import {KimiIO} from './kimi/kimiIO';
import {DeepChat} from '../deepChat';
import {XChatIO} from './x/xChatIO';

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
        if (directConnection.openAI.realtime) {
          return new OpenAIRealtimeIO(deepChat);
        }
        return new OpenAIChatIO(deepChat);
      }
      if (directConnection.assemblyAI) {
        return new AssemblyAIAudioIO(deepChat);
      }
      if (directConnection.cohere) {
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
        if (directConnection.azure.openAI) {
          if (directConnection.azure.openAI.chat) {
            return new AzureOpenAIChatIO(deepChat);
          }
          if (directConnection.azure.openAI.assistant) {
            return new AzureOpenAIAssistantIO(deepChat);
          }
        }
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
      if (directConnection.gemini) {
        return new GeminiIO(deepChat);
      }
      if (directConnection.claude) {
        return new ClaudeIO(deepChat);
      }
      if (directConnection.deepSeek) {
        return new DeepSeekIO(deepChat);
      }
      if (directConnection.miniMax) {
        return new MiniMaxIO(deepChat);
      }
      if (directConnection.openRouter) {
        return new OpenRouterIO(deepChat);
      }
      if (directConnection.kimi) {
        return new KimiIO(deepChat);
      }
      if (directConnection.x) {
        if (directConnection.x.images) {
          return new XImagesIO(deepChat);
        }
        return new XChatIO(deepChat);
      }
      if (directConnection.qwen) {
        return new QwenIO(deepChat);
      }
      if (directConnection.together) {
        if (directConnection.together.images) {
          return new TogetherImagesIO(deepChat);
        }
        if (directConnection.together.textToSpeech) {
          return new TogetherTextToSpeechIO(deepChat);
        }
        return new TogetherChatIO(deepChat);
      }
      if (directConnection.bigModel) {
        if (directConnection.bigModel.images) {
          return new BigModelImagesIO(deepChat);
        }
        if (directConnection.bigModel.textToSpeech) {
          return new BigModelTextToSpeechIO(deepChat);
        }
        return new BigModelChatIO(deepChat);
      }
      if (directConnection.groq) {
        if (directConnection.groq.textToSpeech) {
          return new GroqTextToSpeechIO(deepChat);
        }
        return new GroqChatIO(deepChat);
      }
      if (directConnection.perplexity) {
        return new PerplexityIO(deepChat);
      }
      if (directConnection.ollama) {
        return new OllamaIO(deepChat);
      }
    }
    if (connect && Object.keys(connect).length > 0 && !demo) {
      return new BaseServiceIO(deepChat);
    }
    // when not directConnection and connect connection, we default to demo
    return new BaseServiceIO(deepChat, undefined, demo || true);
  }
}
