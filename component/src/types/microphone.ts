import {ButtonElementStyles, ButtonPosition} from './button';
import {FilesServiceConfig} from './fileServiceConfigs';

export interface MicrophoneStyles {
  default?: ButtonElementStyles;
  active?: ButtonElementStyles;
  unsupported?: ButtonElementStyles;
  position?: ButtonPosition;
}

export type Microphone = true | MicrophoneStyles;

export type AudioFormat = 'mp3' | '4a' | 'webm' | 'mp4' | 'mpga' | 'wav' | 'mpeg' | 'm4a';

export type ExistingServiceAudioRecordingConfig = FilesServiceConfig & {
  microphone?: true | {styles?: MicrophoneStyles; maxDurationSeconds?: number; format?: AudioFormat};
};
