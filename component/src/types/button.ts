import {StatefulStyles} from './styles';

interface ButtonInnerStyles {
  styles?: StatefulStyles;
  content?: string;
}

export interface ButtonStyles {
  container?: StatefulStyles;
  svg?: ButtonInnerStyles;
  text?: ButtonInnerStyles;
}

export type ButtonPosition = 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right' | 'dropup-menu';

export interface Button {
  styles?: ButtonStyles;
  position?: ButtonPosition;
}
