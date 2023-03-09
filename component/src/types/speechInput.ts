import {ButtonElementStyles, ButtonPosition} from './button';

export interface MicrophoneStyles {
  default?: ButtonElementStyles;
  active?: ButtonElementStyles;
  unsupported?: ButtonElementStyles;
  position?: ButtonPosition;
}

export type SpeechInput = true | MicrophoneStyles;
