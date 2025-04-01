import {ButtonPosition, ButtonStyles} from './button';
import {CustomStyle, StatefulStyles} from './styles';

export type CustomButtonChangeState = {
  setActive?: () => void;
  setDefault?: () => void;
  setDisabled?: () => void;
};

export type CustomDropupItemStateStyles = {
  item?: StatefulStyles;
  iconContainer?: CustomStyle;
  text?: CustomStyle;
};

export type CustomDropupItemStyles = {
  text?: string;
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
  initialState?: keyof CustomButtonStyles;
  setState?: CustomButtonChangeState;
  onClick?: (lastState: keyof CustomButtonStyles) => keyof CustomButtonStyles | void;
};
