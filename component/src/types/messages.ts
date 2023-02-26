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

export interface CustomAvatarStyle {
  container?: CustomStyle;
  avatar?: CustomStyle;
  position?: 'left' | 'right';
}

export interface CustomAvatarStyles {
  default?: CustomAvatarStyle;
  user?: CustomAvatarStyle;
  ai?: CustomAvatarStyle;
}
