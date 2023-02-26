import {CustomStyle} from './styles';

export interface CustomMessageStyle {
  outerContainer?: CustomStyle;
  innerContainer?: CustomStyle;
  text?: CustomStyle;
}

export interface CustomMessageStyles {
  default?: CustomMessageStyle;
  user?: CustomMessageStyle;
  ai?: CustomMessageStyle;
}
