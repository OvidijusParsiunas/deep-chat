import {ButtonElementStyles} from './button';

export interface SubmitButtonStyles {
  submit?: ButtonElementStyles;
  loading?: ButtonElementStyles;
  stop?: ButtonElementStyles;
  position?: 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
}
