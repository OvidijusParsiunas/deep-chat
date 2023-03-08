import {ButtonElementStyles, ButtonPosition} from './button';

export type SpeechInput =
  | true
  | {
      default?: ButtonElementStyles;
      active?: ButtonElementStyles;
      disabled?: ButtonElementStyles;
      position?: ButtonPosition;
    };
