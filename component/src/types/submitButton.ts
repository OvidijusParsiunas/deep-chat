import {ButtonStyles} from './button';

export interface SubmitButtonStyles {
  submit?: ButtonStyles;
  loading?: ButtonStyles;
  stop?: ButtonStyles;
  disabled?: ButtonStyles;
  position?: 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
  alwaysEnabled?: boolean;
}

export type DisableSubmitButton = (isDisabled?: boolean) => void;
