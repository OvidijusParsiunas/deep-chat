// https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage
export interface StabilityAIImageToImageUpscale {
  engine_id?: string;
  height?: number;
  width?: number;
}

interface StabilityAICommon {
  engine_id?: string;
  weight?: number;
  cfg_scale?: number;
  clip_guidance_preset?: 'FAST_BLUE' | 'FAST_GREEN' | 'NONE' | 'SIMPLE' | 'SLOW' | 'SLOWER' | 'SLOWEST';
  samples?: number;
  seed?: number;
  steps?: number;
  style_preset?:
    | '3d-model'
    | 'analog-film'
    | 'anime'
    | 'cinematic'
    | 'comic-book'
    | 'digital-art'
    | 'enhance'
    | 'fantasy-art'
    | 'isometric'
    | 'line-art'
    | 'low-poly'
    | 'modeling-compound'
    | 'neon-punk'
    | 'origami'
    | 'photographic'
    | 'pixel-art'
    | 'tile-texture';
  sampler?:
    | 'DDIM'
    | 'DDPM'
    | 'K_DPMPP_2M'
    | 'K_DPMPP_2S_ANCESTRAL'
    | 'K_DPM_2'
    | 'K_DPM_2_ANCESTRAL'
    | 'K_EULER'
    | 'K_EULER_ANCESTRAL'
    | 'K_HEUN'
    | 'K_LMS';
}

// https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking
export type StabilityAIImageToImageMasking = {
  mask_source?: 'MASK_IMAGE_WHITE' | 'MASK_IMAGE_BLACK' | 'INIT_IMAGE_ALPHA';
} & StabilityAICommon;

// https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage
export type StabilityAIImageToImage = {
  init_image_mode?: 'image_strength' | 'step_schedule_*';
  image_strength?: number;
  step_schedule_start: number;
  step_schedule_end: number;
} & StabilityAICommon;

// https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage
export type StabilityAITextToImage = {
  height?: number;
  width?: number;
} & StabilityAICommon;

export interface StabilityAI {
  textToImage?: true | StabilityAITextToImage;
  imageToImage?: true | StabilityAIImageToImage;
  imageToImageMasking?: true | StabilityAIImageToImageMasking;
  imageToImageUpscale?: true | StabilityAIImageToImageUpscale;
}
