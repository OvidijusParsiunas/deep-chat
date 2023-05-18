import {CustomStyle} from './styles';

export interface AvatarStyles {
  container?: CustomStyle;
  avatar?: CustomStyle;
  position?: 'left' | 'right';
}

export interface Avatar {
  src?: string;
  styles?: AvatarStyles;
}

export interface CustomAvatars {
  default?: Omit<Avatar, 'src'>;
  user?: Avatar;
  ai?: Avatar;
}

export type Avatars = true | CustomAvatars;
