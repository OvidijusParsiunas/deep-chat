import {ServiceCallConfig} from './requestSettings';

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
  textGeneration?: true | (HuggingFaceModel & HuggingFaceTextGenerationConfig & ServiceCallConfig);
  summarize?: true | (HuggingFaceModel & HuggingFaceSummarizeConfig & ServiceCallConfig);
}
