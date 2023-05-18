import {CustomStyle} from './styles';

export interface AvatarStyles {
  container?: CustomStyle;
  avatar?: CustomStyle;
  position?: 'left' | 'right';
}

// WORK - ability to set a custom avatar
export interface Avatar {
  base64?: string;
  styles?: AvatarStyles;
}

export interface CustomAvatars {
  default?: Omit<Avatar, 'base64'>;
  user?: Avatar;
  ai?: Avatar;
}

export type Avatars = true | CustomAvatars;
