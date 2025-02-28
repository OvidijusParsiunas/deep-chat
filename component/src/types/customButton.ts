import {ButtonPosition, ButtonStyles} from './button';

export type CustomButtonChangeState = {
  setActive?: () => void;
  setDefault?: () => void;
  setDisabled?: () => void;
};

export type CustomButtonStyles = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  disabled?: ButtonStyles;
};

export type CustomButton = {
  styles?: CustomButtonStyles;
  position?: ButtonPosition;
  dropupText?: string;
  initialState?: keyof CustomButtonStyles;
  setState?: CustomButtonChangeState;
  onClick?: (lastState: keyof CustomButtonStyles) => keyof CustomButtonStyles | void;
};
