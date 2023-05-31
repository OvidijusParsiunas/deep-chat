import {ButtonStyles, ButtonPosition} from './button';
import {FilesConfig} from './fileServiceConfigs';

export interface MicrophoneStyles {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unsupported?: ButtonStyles;
  position?: ButtonPosition;
}

export type Microphone = true | MicrophoneStyles;

export type AudioFormat = 'mp3' | '4a' | 'webm' | 'mp4' | 'mpga' | 'wav' | 'mpeg' | 'm4a';

export type AudioWithMicrophoneConfig = FilesConfig & {
  microphone?: true | {styles?: MicrophoneStyles; maxDurationSeconds?: number; format?: AudioFormat};
};
