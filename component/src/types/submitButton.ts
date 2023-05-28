import {ButtonStyles} from './button';

export interface SubmitButtonStyles {
  submit?: ButtonStyles;
  loading?: ButtonStyles;
  stop?: ButtonStyles;
  position?: 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
}
