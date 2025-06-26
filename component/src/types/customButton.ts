import {ButtonPosition, ButtonStyles} from './button';
import {CustomStyle, StatefulStyles} from './styles';
import {Tooltip} from './tooltip';

export type CustomDropupItemStateStyles = {
  item?: StatefulStyles;
  iconContainer?: CustomStyle;
  text?: CustomStyle;
};

export type CustomDropupItemStyles = {
  default?: CustomDropupItemStateStyles;
  active?: CustomDropupItemStateStyles;
  disabled?: CustomDropupItemStateStyles;
};

export type CustomButtonStyles = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  disabled?: ButtonStyles;
};

export type CustomButton = {
  styles?: {button?: CustomButtonStyles; dropup?: CustomDropupItemStyles};
  position?: ButtonPosition;
  tooltip?: true | Tooltip;
  initialState?: keyof CustomButtonStyles;
  setState?: (state: keyof CustomButtonStyles) => void;
  onClick?: (lastState: keyof CustomButtonStyles) => keyof CustomButtonStyles | void;
};
