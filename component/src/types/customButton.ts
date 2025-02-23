import {ButtonPosition, ButtonStyles} from './button';

export type CustomButtonChangeState = {
  setActive?: () => void;
  setDefault?: () => void;
  setUnavailable?: () => void;
};

export type CustomButtonStyles = {
  default?: ButtonStyles;
  active?: ButtonStyles;
  unavailable?: ButtonStyles;
};

export type CustomButton = {
  styles?: CustomButtonStyles;
  position?: ButtonPosition;
  dropupText?: string;
  initialState?: keyof CustomButtonStyles;
  onClick?: (lastState: keyof CustomButtonStyles) => keyof CustomButtonStyles | undefined;
  setState?: CustomButtonChangeState;
};
