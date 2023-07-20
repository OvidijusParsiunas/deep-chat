import {GenericObject} from './object';

// https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage
export interface StabilityAITextToImage {
  engineId?: string;
  weight?: number;
  height?: number;
  width?: number;
  cfg_scale?: number;
  clip_guidance_preset?: 'FAST_BLUE' | 'FAST_GREEN' | 'NONE' | 'SIMPLE' | 'SLOW' | 'SLOWER' | 'SLOWEST';
  samples?: number;
  seed?: number;
  steps?: number;
  extras?: GenericObject;
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

export interface StabilityAI {
  textToImage?: true | StabilityAITextToImage;
}
