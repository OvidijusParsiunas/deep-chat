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
  startingState?: keyof CustomButtonStyles;
  dropupText?: string;
  onClick?: (lastState: keyof CustomButtonStyles) => keyof CustomButtonStyles | undefined;
  changeState?: CustomButtonChangeState;
};
