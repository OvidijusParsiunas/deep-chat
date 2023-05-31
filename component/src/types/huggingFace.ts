import {AudioWithMicrophoneConfig} from './microphone';
import {ServiceCallConfig} from './requestSettings';
import {ImagesWithCameraConfig} from './camera';
import {MessageLimits} from './chatLimits';
import {Key} from './key';

// https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task
export interface HuggingFaceConversationConfig {
  parameters?: {
    min_length?: number;
    max_length?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repetition_penalty?: number;
  };
  options?: {
    use_cache?: boolean;
  };
}

// https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task
export interface HuggingFaceQuestionAnswerConfig {
  context: string;
}

// https://huggingface.co/docs/api-inference/detailed_parameters#fill-mask-task
export interface HuggingFaceFillMaskConfig {
  options?: {
    use_cache?: boolean;
  };
}

// https://huggingface.co/docs/api-inference/detailed_parameters#translation-task
export interface HuggingFaceTranslationConfig {
  options?: {
    use_cache?: boolean;
  };
}

// https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task
export interface HuggingFaceSummarizationConfig {
  parameters?: {
    min_length?: number;
    max_length?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repetition_penalty?: number;
  };
  options?: {
    use_cache?: boolean;
  };
}

// https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task
export interface HuggingFaceTextGenerationConfig {
  parameters?: {
    top_k?: number;
    top_p?: number;
    temperature?: number;
    repetition_penalty?: number;
    max_new_tokens?: number;
    return_full_text?: boolean;
    do_sample?: boolean;
  };
  options?: {
    use_cache?: boolean;
  };
}

export interface HuggingFaceModel {
  model?: string;
}

export interface HuggingFace {
  conversation?: true | (Key & ServiceCallConfig & HuggingFaceModel & HuggingFaceConversationConfig & MessageLimits);
  textGeneration?: true | (Key & ServiceCallConfig & HuggingFaceModel & HuggingFaceTextGenerationConfig);
  summarization?: true | (Key & ServiceCallConfig & HuggingFaceModel & HuggingFaceSummarizationConfig);
  translation?: true | (Key & ServiceCallConfig & HuggingFaceModel & HuggingFaceTranslationConfig);
  fillMask?: true | (Key & ServiceCallConfig & HuggingFaceModel & HuggingFaceFillMaskConfig);
  questionAnswer?: Key & ServiceCallConfig & HuggingFaceQuestionAnswerConfig & HuggingFaceModel;
  audioSpeechRecognition?: true | (Key & ServiceCallConfig & HuggingFaceModel & AudioWithMicrophoneConfig);
  audioClassification?: true | (Key & ServiceCallConfig & HuggingFaceModel & AudioWithMicrophoneConfig);
  imageClassification?: true | (Key & ServiceCallConfig & HuggingFaceModel & ImagesWithCameraConfig);
}
