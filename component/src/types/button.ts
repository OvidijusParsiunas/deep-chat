import {StatefulStyles} from './styles';

interface ButtonInnerElementStyles {
  styles?: StatefulStyles;
  string?: string;
}

export interface ButtonElementStyles {
  container?: StatefulStyles;
  svg?: ButtonInnerElementStyles;
  text?: ButtonInnerElementStyles;
}

export type ButtonPosition = 'inside-left' | 'inside-right' | 'outside-left' | 'outside-right';
