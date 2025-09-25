import {ButtonStyles} from './button';
import {Tooltip} from './tooltip';

export interface SubmitButtonStyles {
  submit?: ButtonStyles;
  loading?: ButtonStyles;
  stop?: ButtonStyles;
  disabled?: ButtonStyles;
  alwaysEnabled?: boolean;
  position?: 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
  tooltip?: true | Tooltip;
}

export type DisableSubmitButton = (isDisabled?: boolean) => void;
