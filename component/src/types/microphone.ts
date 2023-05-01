import {ButtonElementStyles, ButtonPosition} from './button';

export interface MicrophoneStyles {
  default?: ButtonElementStyles;
  active?: ButtonElementStyles;
  unsupported?: ButtonElementStyles;
  position?: ButtonPosition;
}

export type Microphone = true | MicrophoneStyles;

export type AudioFormat = 'mp3' | '4a' | 'webm' | 'mp4' | 'mpga' | 'wav' | 'mpeg' | 'm4a';

export interface ExistingServiceAudioRecordingConfig {
  microphone?: true | {styles?: MicrophoneStyles; maxDurationSeconds?: number; format?: AudioFormat};
}
