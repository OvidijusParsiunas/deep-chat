import {CustomStyle} from './styles';

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
