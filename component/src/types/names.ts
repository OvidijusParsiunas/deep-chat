import {CustomStyle} from './styles';

export interface Name {
  text?: string;
  style?: CustomStyle;
  position?: 'left' | 'right';
}

export interface CustomNames {
  default?: Name;
  ai?: Name;
  user?: Name;
}

export type Names = true | CustomNames;
