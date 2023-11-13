import {CustomStyle} from './styles';

export interface Name {
  text?: string;
  style?: CustomStyle;
  position?: 'left' | 'right';
}

export type CustomNames = {default?: Name; ai?: Name; user?: Name} & {[name: string]: Name};

export type Names = true | CustomNames;
