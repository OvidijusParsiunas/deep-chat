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
    do_sample?: boolean;
  };
  options?: {
    use_cache?: boolean;
  };
}

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

export interface HuggingFaceModel {
  model?: string;
}

export type HuggingFace = {
  conversation?: true | (HuggingFaceModel & HuggingFaceConversationConfig);
  textGeneration?: true | (HuggingFaceModel & HuggingFaceTextGenerationConfig);
  summarization?: true | (HuggingFaceModel & HuggingFaceSummarizationConfig);
  translation?: true | (HuggingFaceModel & HuggingFaceTranslationConfig);
  fillMask?: true | (HuggingFaceModel & HuggingFaceFillMaskConfig);
  questionAnswer?: HuggingFaceModel & HuggingFaceQuestionAnswerConfig;
  audioSpeechRecognition?: true | HuggingFaceModel;
  audioClassification?: true | HuggingFaceModel;
  imageClassification?: true | HuggingFaceModel;
};
