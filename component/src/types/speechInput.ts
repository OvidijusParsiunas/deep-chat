import {ButtonElementStyles, ButtonPosition} from './button';

export interface MicrophoneStyles {
  default?: ButtonElementStyles;
  active?: ButtonElementStyles;
  disabled?: ButtonElementStyles;
  position?: ButtonPosition;
}

export type SpeechInput = true | MicrophoneStyles;
