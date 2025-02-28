import {FILE_TYPE} from './fileTypes';

export type BUTTON_TYPE = FILE_TYPE | 'camera' | 'microphone' | 'submit' | `custom${number}`;
