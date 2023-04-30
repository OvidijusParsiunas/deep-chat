import {ButtonElementStyles, ButtonPosition} from './button';

export interface MicrophoneStyles {
  default?: ButtonElementStyles;
  active?: ButtonElementStyles;
  unsupported?: ButtonElementStyles;
  position?: ButtonPosition;
}

export type Microphone = true | MicrophoneStyles;

export interface MicrophoneI {
  microphone?: Microphone;
}
