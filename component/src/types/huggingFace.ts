import {ExistingServiceAudioRecordingConfig} from './microphone';
import {FilesServiceConfig} from './fileServiceConfigs';
import {ExistingServiceCameraConfig} from './camera';
import {ServiceCallConfig} from './requestSettings';
import {ChatMessageLimits} from './chatLimits';

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
export interface HuggingFaceSummarizeConfig {
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
  conversation?: true | (HuggingFaceModel & HuggingFaceConversationConfig & ServiceCallConfig & ChatMessageLimits);
  textGeneration?: true | (HuggingFaceModel & HuggingFaceTextGenerationConfig & ServiceCallConfig);
  summarize?: true | (HuggingFaceModel & HuggingFaceSummarizeConfig & ServiceCallConfig);
  translation?: true | (HuggingFaceModel & HuggingFaceTranslationConfig & ServiceCallConfig);
  fillMask?: true | (HuggingFaceModel & HuggingFaceFillMaskConfig & ServiceCallConfig);
  questionAnswer?: HuggingFaceQuestionAnswerConfig & HuggingFaceModel & ServiceCallConfig;
  audioSpeechRecognition?:
    | true
    | (HuggingFaceModel & ServiceCallConfig & FilesServiceConfig & ExistingServiceAudioRecordingConfig);
  audioClassification?:
    | true
    | (HuggingFaceModel & ServiceCallConfig & FilesServiceConfig & ExistingServiceAudioRecordingConfig);
  imageClassification?: true | (HuggingFaceModel & FilesServiceConfig & ExistingServiceCameraConfig);
}
