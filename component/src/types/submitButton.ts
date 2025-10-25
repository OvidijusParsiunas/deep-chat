import {ButtonStyles} from './button';
import {Tooltip} from './tooltip';

export interface SubmitButtonStyles {
  submit?: ButtonStyles;
  loading?: ButtonStyles;
  stop?: ButtonStyles;
  disabled?: ButtonStyles;
  alwaysEnabled?: boolean;
  position?: 'inside-start' | 'inside-end' | 'outside-start' | 'outside-end';
  tooltip?: true | Tooltip;
}

export type DisableSubmitButton = (isDisabled?: boolean) => void;
