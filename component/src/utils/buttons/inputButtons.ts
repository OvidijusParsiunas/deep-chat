import {BUTTON_TYPE} from '../../types/buttonTypes';
import {SUBMIT} from '../consts/inputConstants';

// this is mostly used for setting an order for dropup menu items
export const BUTTON_ORDER: readonly BUTTON_TYPE[] = [
  'camera',
  'gifs',
  'images',
  'audio',
  'mixedFiles',
  SUBMIT,
  'microphone',
];
