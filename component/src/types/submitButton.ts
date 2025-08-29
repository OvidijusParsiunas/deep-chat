import {ButtonStyles} from './button';
import {Tooltip} from './tooltip';

export interface SubmitButtonStyles {
  submit?: ButtonStyles;
  loading?: ButtonStyles;
  stop?: ButtonStyles;
  disabled?: ButtonStyles;
  position?: 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
  tooltip?: true | Tooltip;
  alwaysEnabled?: boolean;
}

export type DisableSubmitButton = (isDisabled?: boolean) => void;
